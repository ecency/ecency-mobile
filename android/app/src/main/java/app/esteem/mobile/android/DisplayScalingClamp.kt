package app.esteem.mobile.android

import android.content.Context
import android.content.res.Configuration
import android.util.DisplayMetrics

/**
 * Single source of truth for clamping extreme system accessibility scaling.
 *
 * A very large "Display size" (densityDpi) or "Font size" (fontScale) otherwise renders the whole
 * app abnormally "zoomed in" (oversized text/images/icons + overflowing layouts). We clamp — not
 * disable — so moderate accessibility scaling still works.
 *
 * Applied from BOTH [MainActivity.attachBaseContext] (the Activity context governs view rendering)
 * and [MainApplication.attachBaseContext] (the Application context is what React Native uses to
 * initialize its display metrics, i.e. what Dimensions.get('window') reports). An Activity's base
 * context is created by the system from the raw config, so both must be clamped independently.
 *
 * Note: density/fontScale are intentionally NOT in AndroidManifest configChanges. attachBaseContext
 * only runs at Activity creation, so an in-session change must recreate the Activity to re-apply
 * this clamp; declaring them as handled would suppress the recreation and bypass it.
 */
object DisplayScalingClamp {
    private const val MAX_FONT_SCALE = 1.3f // ~Android "Large" font step
    private const val MAX_DENSITY_SCALE = 1.15f // relative to device default density

    @JvmStatic
    fun wrap(base: Context): Context {
        val config = Configuration(base.resources.configuration)
        var changed = false

        if (config.fontScale > MAX_FONT_SCALE) {
            config.fontScale = MAX_FONT_SCALE
            changed = true
        }

        // DENSITY_DEVICE_STABLE is the device's default dpi, unaffected by the user's Display-size override.
        val maxDpi = Math.round(DisplayMetrics.DENSITY_DEVICE_STABLE * MAX_DENSITY_SCALE)
        if (config.densityDpi > maxDpi) {
            config.densityDpi = maxDpi
            changed = true
        }

        return if (changed) base.createConfigurationContext(config) else base
    }
}
