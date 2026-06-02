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
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

//expo related packages
import android.content.Context
import android.content.res.Configuration
import android.util.DisplayMetrics
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

    // Clamp extreme system "Font size" (fontScale) and "Display size" (densityDpi)
    // on the application context too. RN initializes its display metrics (what
    // Dimensions.get('window') reports) from the app context, so clamping here keeps
    // layout math consistent with the clamped rendering done via MainActivity. See
    // MainActivity.attachBaseContext for the matching clamp and rationale.
    override fun attachBaseContext(base: Context) {
        val config = Configuration(base.resources.configuration)
        var changed = false

        if (config.fontScale > MAX_FONT_SCALE) {
            config.fontScale = MAX_FONT_SCALE
            changed = true
        }

        val maxDpi = Math.round(DisplayMetrics.DENSITY_DEVICE_STABLE * MAX_DENSITY_SCALE)
        if (config.densityDpi > maxDpi) {
            config.densityDpi = maxDpi
            changed = true
        }

        super.attachBaseContext(if (changed) base.createConfigurationContext(config) else base)
    }

    companion object {
        private const val MAX_FONT_SCALE = 1.3f     // ~Android "Large" font step
        private const val MAX_DENSITY_SCALE = 1.15f // relative to device default density
    }
}
