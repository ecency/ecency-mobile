package app.esteem.mobile.android;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null); //https://stackoverflow.com/questions/57709742/unable-to-instantiate-fragment-com-swmansion-rnscreens-screen

        Intent intent = new Intent(this, MainActivity.class);

        //workaround for getInitialNotification and onNotificationOpenedApp returning null always
        //TOOD: use react-native-bootsplash instead of react-native-splash-screen as recommended by firebase
        //firebase issue ref: https://github.com/invertase/react-native-firebase/issues/3469
        //ecency project card ref: https://github.com/orgs/ecency/projects/2#card-85455956
        Bundle extras = getIntent().getExtras();
        if (extras != null) {
            intent.putExtras(extras);
        }

        startActivity(intent);
        finish();
    }
}
