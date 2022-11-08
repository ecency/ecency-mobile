package app.esteem.mobile.android;

import android.app.Application;

import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.soloader.SoLoader;
import app.esteem.mobile.android.newarchitecture.MainApplicationReactNativeHost;
import androidx.multidex.MultiDexApplication;
import com.getkeepsafe.relinker.ReLinker;
import com.bugsnag.android.Bugsnag;
import org.wonday.orientation.OrientationActivityLifecycle;

//See below, Webview debugging
//import android.webkit.WebView; 

import com.reactnativepagerview.PagerViewPackage;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import com.facebook.react.bridge.JSIModulePackage; 
import com.swmansion.reanimated.ReanimatedJSIModulePackage;

public class MainApplication extends MultiDexApplication implements ReactApplication {

  private final ReactNativeHost mNewArchitectureNativeHost =
    new MainApplicationReactNativeHost(this);

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
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
      protected JSIModulePackage getJSIModulePackage() {
        return new ReanimatedJSIModulePackage(); 
      }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      return mNewArchitectureNativeHost;
    } else {
      return mReactNativeHost;
    }
  }

  @Override
  public void onCreate() {
    super.onCreate();
    // Relink bugsnag for ndk and anr cases
    ReLinker.loadLibrary(this, "bugsnag-ndk");
    ReLinker.loadLibrary(this, "bugsnag-plugin-android-anr");
    // Start bugsnag
    Bugsnag.start(this /* app context */);

    // If you opted-in for the New Architecture, we enable the TurboModule system
    ReactFeatureFlags.useTurboModules = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    SoLoader.init(this, /* native exopackage */ false);
    // Uncomment below line to Debug Webview
    // WebView.setWebContentsDebuggingEnabled(true);
    registerActivityLifecycleCallbacks(OrientationActivityLifecycle.getInstance());
  }
}
