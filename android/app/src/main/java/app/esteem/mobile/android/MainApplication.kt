package app.esteem.mobile.android

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import java.util.concurrent.TimeUnit

//expo related packages
import android.content.Context
import android.content.res.Configuration
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

//custom packages
import org.wonday.orientation.OrientationActivityLifecycle
import com.reactnativepagerview.PagerViewPackage

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        ReactNativeHostWrapper(this, object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> {
                val packages = PackageList(this).packages
                // Packages that cannot be autolinked yet can be added manually here, for example:
                // packages.add(new MyReactNativePackage())
                packages.add(PagerViewPackage())
                return packages
            }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }
    )

    override val reactHost: ReactHost
        get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()

        // React Native builds its shared OkHttpClient with connect, read and write
        // timeouts of 0, which OkHttp reads as "wait forever"
        // (OkHttpClientProvider.createClientBuilder). A socket that is accepted and
        // then goes silent therefore never produces an error, and the JS promise
        // behind it never settles.
        //
        // connectTimeout is the one that changes behaviour rather than just adding a
        // ceiling: OkHttp tries a host's addresses one route at a time, each with its
        // own connect timeout, so with 0 a single black-holed address hangs the call
        // forever and the remaining addresses are never tried. 10s is well above a
        // real handshake even on a poor link, and low enough that a dead route falls
        // over to the next one inside the JS deadline (utils/networkTimeout).
        //
        // read and write are deliberately left alone. They are idle timeouts applied
        // to every request on the shared client, so any value low enough to be a
        // useful backstop is also low enough to cut short a request that asked for
        // longer: a server that accepts an order and then works on it silently would
        // be aborted mid-flight, which is the unknown-outcome case the wider
        // purchase deadline exists to avoid. The per-request deadline belongs on
        // callTimeout, which React Native sets per request from the JS-side timeout
        // (NetworkingModule), and every JS caller now carries one.
        //
        // Must be set before the first client is created, which happens when
        // NetworkingModule is built.
        OkHttpClientProvider.setOkHttpClientFactory(
            OkHttpClientFactory {
                // createClientBuilder(context) keeps React Native's own cookie jar
                // and its 10MB response cache; only the timeouts change.
                OkHttpClientProvider.createClientBuilder(this)
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .build()
            }
        )

        SoLoader.init(this, OpenSourceMergedSoMapping)

        registerActivityLifecycleCallbacks(OrientationActivityLifecycle.getInstance())

        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }

        ApplicationLifecycleDispatcher.onApplicationCreate(this)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
    }

    // Clamp the same extreme scaling on the application context: RN initializes its
    // display metrics (what Dimensions.get('window') reports) from the app context, so
    // clamping here keeps layout consistent with the rendering clamp in MainActivity.
    // See DisplayScalingClamp for details.
    override fun attachBaseContext(base: Context) {
        super.attachBaseContext(DisplayScalingClamp.wrap(base))
    }
}
