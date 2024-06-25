package app.esteem.mobile.android;

import android.app.Application;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

import android.content.res.Configuration;
import expo.modules.ApplicationLifecycleDispatcher;
import expo.modules.ReactNativeHostWrapper;

import androidx.multidex.MultiDexApplication;
import com.getkeepsafe.relinker.ReLinker;
import com.bugsnag.android.Bugsnag;
import org.wonday.orientation.OrientationActivityLifecycle;

//See below, Webview debugging
//import android.webkit.WebView; 

import com.reactnativepagerview.PagerViewPackage;
import com.vydia.RNUploader.UploaderReactPackage;

import java.util.List;

import com.facebook.react.bridge.JSIModulePackage;

public class MainApplication extends MultiDexApplication implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHostWrapper(this, new DefaultReactNativeHost(this) {

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();
      // Packages that cannot be autolinked yet can be added manually here, for
      // example:
      // packages.add(new MyReactNativePackage());
      packages.add(new PagerViewPackage());
      return packages;
    }


    @Override
    protected String getJSMainModuleName() {
      return "index";
    }

    @Override
    protected boolean isNewArchEnabled() {
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }

    @Override
    protected Boolean isHermesEnabled() {
      return BuildConfig.IS_HERMES_ENABLED;
    }
  });

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    // Relink bugsnag for ndk and anr cases
    ReLinker.loadLibrary(this, "bugsnag-ndk");
    ReLinker.loadLibrary(this, "bugsnag-plugin-android-anr");
    // Start bugsnag
    Bugsnag.start(this /* app context */);

    SoLoader.init(this, /* native exopackage */ false);
    // Uncomment below line to Debug Webview
    // WebView.setWebContentsDebuggingEnabled(true);
    registerActivityLifecycleCallbacks(OrientationActivityLifecycle.getInstance());

    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for
      // this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    // ReactNativeFlipper.initializeFlipper(this,
    // getReactNativeHost().getReactInstanceManager());
    ApplicationLifecycleDispatcher.onApplicationCreate(this);

  }

  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig);
  }

}
