import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  } as ViewStyle,
  reel: {
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
  } as ViewStyle,
  videoLayer: {
    ...({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as ViewStyle),
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  webview: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  } as ViewStyle,
  poster: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  posterImage: {
    ...({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as ImageStyle),
    width: '100%',
    height: '100%',
    opacity: 0.9,
  } as ImageStyle,
  posterFallback: {
    ...({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as ViewStyle),
    backgroundColor: '#1a1a1a',
  } as ViewStyle,
  playBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  } as ViewStyle,
  playIcon: {
    color: '#fff',
    fontSize: 38,
  } as TextStyle,
  bottomOverlay: {
    ...({ position: 'absolute', left: 0, right: 64, bottom: 0 } as ViewStyle),
    padding: 16,
    paddingBottom: 24,
  } as ViewStyle,
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  authorName: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  } as TextStyle,
  caption: {
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  } as TextStyle,
  rail: {
    ...({ position: 'absolute', right: 8, bottom: 24 } as ViewStyle),
    alignItems: 'center',
  } as ViewStyle,
  railBtn: {
    alignItems: 'center',
    marginBottom: 18,
  } as ViewStyle,
  railIcon: {
    color: '#fff',
    fontSize: 30,
  } as TextStyle,
  railIconVoted: {
    color: '#357ce6',
    fontSize: 30,
  } as TextStyle,
  railText: {
    marginTop: 2,
    color: '#fff',
    fontSize: 12,
  } as TextStyle,
  muteBtn: {
    ...({ position: 'absolute', top: 12, right: 12 } as ViewStyle),
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  } as ViewStyle,
  muteIcon: {
    color: '#fff',
    fontSize: 18,
  } as TextStyle,
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  } as ViewStyle,
  emptyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    textAlign: 'center',
  } as TextStyle,
});
