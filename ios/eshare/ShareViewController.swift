//
//  ShareViewController.swift
//  eshare
//
//  iOS share extension for Ecency. Accepts images, text, and web URLs from
//  the system share sheet and hands them off to the main Ecency app so the
//  editor opens pre-populated. No intermediate compose dialog is shown —
//  tapping Ecency in the share sheet takes the user straight to the editor.
//
//  Data handoff:
//    1. Attachments are decoded off the main queue via NSItemProvider.
//    2. Image files are copied into the shared App Group container
//       (group.com.ecency.eshare) so they survive after this extension is
//       torn down.
//    3. Metadata is serialized into UserDefaults(suiteName:) under the
//       ShareKey key, in the format react-native-receive-sharing-intent
//       expects on the host-app side.
//    4. We open the host app via the "ShareMedia://dataUrl=ShareKey#<type>"
//       URL, using the responder-chain openURL: walk. This path is still
//       honored by iOS 18 in practice and is what the upstream library
//       recommends consumers use.
//
//  Important: Both the main app and this extension must declare the
//  group.com.ecency.eshare App Group in their entitlements. The main app's
//  copy of react-native-receive-sharing-intent is also patched to read
//  from this exact group (see patches/react-native-receive-sharing-intent+2.0.0.patch).
//

import UIKit
import MobileCoreServices
import UniformTypeIdentifiers

@objc(ShareViewController)
class ShareViewController: UIViewController {
    // MARK: - Constants

    /// App Group id shared between this extension and the host app. Must
    /// match both entitlements files AND the patched read side of
    /// react-native-receive-sharing-intent on the host.
    private let appGroupId = "group.com.ecency.eshare"

    /// Key the host app reads to pull the shared payload out of
    /// UserDefaults(suiteName: appGroupId).
    private let sharedKey = "ShareKey"

    /// URL scheme registered in Ecency/Info.plist under CFBundleURLSchemes.
    /// react-native-receive-sharing-intent filters incoming URLs with this
    /// prefix in ReceiveSharingIntent.ts:getReceivedFiles.
    private let hostScheme = "ShareMedia"

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        // Keep the extension visually invisible. iOS will still briefly render
        // a blank sheet while this VC is on screen; we dismiss as soon as the
        // attachments are decoded.
        view.backgroundColor = .clear
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        processSharedAttachments()
    }

    // MARK: - Attachment processing

    private func processSharedAttachments() {
        guard let inputItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            dismissExtension()
            return
        }

        // Flatten every attachment across every input item. iOS can hand us
        // multiple NSExtensionItems (rare), each with several NSItemProviders.
        var providers: [NSItemProvider] = []
        for item in inputItems {
            if let attachments = item.attachments {
                providers.append(contentsOf: attachments)
            }
        }

        guard !providers.isEmpty else {
            dismissExtension()
            return
        }

        // Decoded results accumulate into these two buckets. Access is
        // synchronized through the dispatch group's serial completion queue
        // (notify(queue: .main)), so we don't need additional locking.
        var sharedMedia: [SharedMediaFile] = []
        var sharedText: [String] = []

        let imageType = UTType.image.identifier
        let textType = UTType.text.identifier
        let urlType = UTType.url.identifier

        let group = DispatchGroup()

        for provider in providers {
            // Order matters: URL conforms to text on some content types, and
            // image is the narrowest check so we try it first.
            if provider.hasItemConformingToTypeIdentifier(imageType) {
                group.enter()
                provider.loadItem(forTypeIdentifier: imageType, options: nil) { [weak self] data, _ in
                    defer { group.leave() }
                    guard let self = self else { return }
                    if let imageURL = data as? URL,
                       let copied = self.copyImageToGroupContainer(source: imageURL) {
                        sharedMedia.append(SharedMediaFile(
                            path: copied, thumbnail: nil, duration: nil, type: .image
                        ))
                    } else if let image = data as? UIImage,
                              let copied = self.writeUIImageToGroupContainer(image: image) {
                        sharedMedia.append(SharedMediaFile(
                            path: copied, thumbnail: nil, duration: nil, type: .image
                        ))
                    }
                }
            } else if provider.hasItemConformingToTypeIdentifier(urlType) {
                group.enter()
                provider.loadItem(forTypeIdentifier: urlType, options: nil) { data, _ in
                    defer { group.leave() }
                    if let url = data as? URL {
                        sharedText.append(url.absoluteString)
                    }
                }
            } else if provider.hasItemConformingToTypeIdentifier(textType) {
                group.enter()
                provider.loadItem(forTypeIdentifier: textType, options: nil) { data, _ in
                    defer { group.leave() }
                    if let text = data as? String {
                        sharedText.append(text)
                    }
                }
            }
        }

        group.notify(queue: .main) { [weak self] in
            self?.writeAndRedirect(media: sharedMedia, text: sharedText)
        }
    }

    /// Copies a file URL into the shared App Group container so the host app
    /// can read it after this extension is torn down. Returns the new
    /// absolute URL string (what the host expects in SharedMediaFile.path)
    /// or nil on failure.
    private func copyImageToGroupContainer(source: URL) -> String? {
        guard let containerURL = FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: appGroupId) else {
            return nil
        }
        let ext = source.pathExtension.isEmpty ? "img" : source.pathExtension
        let destination = containerURL.appendingPathComponent("\(UUID().uuidString).\(ext)")
        do {
            if FileManager.default.fileExists(atPath: destination.path) {
                try FileManager.default.removeItem(at: destination)
            }
            try FileManager.default.copyItem(at: source, to: destination)
            return destination.absoluteString
        } catch {
            print("[eshare] copy failed from \(source) to \(destination): \(error)")
            return nil
        }
    }

    /// Some providers hand us a decoded UIImage rather than a URL (e.g. the
    /// system screenshot sheet). Materialize it as PNG inside the App Group.
    private func writeUIImageToGroupContainer(image: UIImage) -> String? {
        guard let containerURL = FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: appGroupId),
              let data = image.pngData() else {
            return nil
        }
        let destination = containerURL.appendingPathComponent("\(UUID().uuidString).png")
        do {
            try data.write(to: destination)
            return destination.absoluteString
        } catch {
            print("[eshare] write UIImage failed: \(destination) — \(error)")
            return nil
        }
    }

    // MARK: - Handoff

    private func writeAndRedirect(media: [SharedMediaFile], text: [String]) {
        let userDefaults = UserDefaults(suiteName: appGroupId)

        if !media.isEmpty {
            if let encoded = try? JSONEncoder().encode(media) {
                userDefaults?.set(encoded, forKey: sharedKey)
                userDefaults?.synchronize()
                redirectToHostApp(fragment: "media")
                return
            }
        }

        if !text.isEmpty {
            userDefaults?.set(text, forKey: sharedKey)
            userDefaults?.synchronize()
            redirectToHostApp(fragment: "text")
            return
        }

        // Nothing usable — just close the sheet without bothering the host.
        dismissExtension()
    }

    private func redirectToHostApp(fragment: String) {
        let urlString = "\(hostScheme)://dataUrl=\(sharedKey)#\(fragment)"
        guard let url = URL(string: urlString) else {
            dismissExtension()
            return
        }

        // Walk the responder chain and invoke openURL: on whatever responds.
        // This is the same approach upstream react-native-receive-sharing-intent
        // documents for consumers, and it is still honored by iOS 18 in practice.
        // We complete the extension context immediately after so iOS tears down
        // the sheet even if the open call is deferred.
        var responder: UIResponder? = self
        let selector = sel_registerName("openURL:")
        while let current = responder {
            if current.responds(to: selector) {
                _ = current.perform(selector, with: url)
                break
            }
            responder = current.next
        }

        dismissExtension()
    }

    private func dismissExtension() {
        DispatchQueue.main.async { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }

    // MARK: - Shared data model

    /// Must stay wire-compatible with the SharedMediaFile struct in
    /// react-native-receive-sharing-intent's ReceiveSharingIntent.swift. In
    /// particular, SharedMediaType must match its rawValues exactly or the
    /// host-side JSON decoder will rewrite the type as it round-trips.
    class SharedMediaFile: Codable {
        let path: String
        let thumbnail: String?
        let duration: Double?
        let type: SharedMediaType

        init(path: String, thumbnail: String?, duration: Double?, type: SharedMediaType) {
            self.path = path
            self.thumbnail = thumbnail
            self.duration = duration
            self.type = type
        }
    }

    /// Matches react-native-receive-sharing-intent's SharedMediaType enum.
    /// The old Ecency version of this enum was missing `video`, which
    /// silently renumbered `file` from 1 to 2 on encode vs decode.
    enum SharedMediaType: Int, Codable {
        case image
        case video
        case file
    }
}
