package app.esteem.mobile.android;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import expo.modules.ReactActivityDelegateWrapper;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.util.DisplayMetrics;
import com.zoontek.rnbootsplash.RNBootSplash;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;

public class MainActivity extends ReactActivity {
  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected String getMainComponentName() {
    return "Ecency";
  }

  // Upper bounds for system accessibility scaling. Beyond these the entire UI
  // (text, images, icons) renders abnormally "zoomed in" and overflows layouts.
  // We honor scaling up to these caps (preserving accessibility) and clamp past.
  private static final float MAX_FONT_SCALE = 1.3f;     // ~Android "Large" font step
  private static final float MAX_DENSITY_SCALE = 1.15f; // relative to device default density

  // Clamp extreme system "Font size" (fontScale) and "Display size" (densityDpi)
  // at the resource layer before any view is created. This is the primary fix for
  // the abnormal-zoom reports: a user with a very large Display size / Font size
  // would otherwise get the whole app scaled up with content overflowing the screen.
  //
  // NOTE: density/fontScale are intentionally NOT added to AndroidManifest
  // configChanges. That way an in-session Display-size/Font-size change recreates
  // the Activity, which re-runs this clamp. Declaring them in configChanges would
  // suppress the recreation and bypass the clamp until the next app launch.
  @Override
  protected void attachBaseContext(Context newBase) {
    Configuration config = new Configuration(newBase.getResources().getConfiguration());
    boolean changed = false;

    if (config.fontScale > MAX_FONT_SCALE) {
      config.fontScale = MAX_FONT_SCALE;
      changed = true;
    }

    int defaultDpi = DisplayMetrics.DENSITY_DEVICE_STABLE; // device "Default" Display size dpi
    int maxDpi = Math.round(defaultDpi * MAX_DENSITY_SCALE);
    if (config.densityDpi > maxDpi) {
      config.densityDpi = maxDpi;
      changed = true;
    }

    if (changed) {
      newBase = newBase.createConfigurationContext(config);
    }
    super.attachBaseContext(newBase);
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {

    DefaultReactActivityDelegate defDelegate = new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            DefaultNewArchitectureEntryPoint.getFabricEnabled());

    ReactActivityDelegateWrapper delegate = new ReactActivityDelegateWrapper(
            this,
            BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
            defDelegate);

    return delegate;
  }


  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    RNBootSplash.init(this, R.style.BootTheme); // <- initialize the splash screen
    super.onCreate(null); //https://stackoverflow.com/questions/57709742/unable-to-instantiate-fragment-com-swmansion-rnscreens-screen
  }

  //native side reference: https://github.com/facebook/react-native/issues/28823#issuecomment-642032481
  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    // getReactInstanceManager().onConfigurationChanged(this, newConfig);
    if (getApplication() instanceof ReactApplication) {
      ReactNativeHost host = ((ReactApplication) getApplication()).getReactNativeHost();
      if (host != null && host.getReactInstanceManager() != null) {
        host.getReactInstanceManager().onConfigurationChanged(this, newConfig);
      }
    }
    Intent intent = new Intent("onConfigurationChanged");
    intent.putExtra("newConfig", newConfig);
    this.sendBroadcast(intent);
  }
}
