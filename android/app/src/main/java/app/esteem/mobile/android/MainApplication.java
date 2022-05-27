package app.esteem.mobile.android;

import android.app.Application;

import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import androidx.multidex.MultiDexApplication;
import com.getkeepsafe.relinker.ReLinker;
import com.bugsnag.android.Bugsnag;
import org.wonday.orientation.OrientationActivityLifecycle;

//See below, Webview debugging
//import android.webkit.WebView; 

import com.reactnativepagerview.PagerViewPackage;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class MainApplication extends MultiDexApplication implements ReactApplication {

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
  };

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
  }
}
