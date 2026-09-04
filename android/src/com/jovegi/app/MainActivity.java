package com.jovegi.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;

/**
 * Jo-Vegi — official app shell.
 * Splash screen shows the official Jo-Vegi badge while the site loads.
 */
public class MainActivity extends Activity {

    private static final String URL = "https://jo-vegi.github.io/jo-vegi/";
    private static final String OFFLINE_HTML =
        "<html dir='rtl'><body style='background:#052e16;color:#a3e635;font-family:sans-serif;text-align:center;padding-top:90px'>" +
        "<h1 style='color:#eab308'>Jo-Vegi | جو-فيجي</h1>" +
        "<p>لا يوجد اتصال بالإنترنت<br><span dir='ltr'>No internet connection — check your network and retry.</span></p>" +
        "<p><a href='" + URL + "' style='color:#a3e635'>إعادة المحاولة ↻</a></p></body></html>";

    private WebView web;
    private FrameLayout root;
    private ImageView splash;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        root = new FrameLayout(this);
        root.setBackgroundColor(0xFFFFFFFF);

        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        // startup splash with the official Jo-Vegi badge
        splash = new ImageView(this);
        splash.setImageResource(R.mipmap.ic_launcher);
        splash.setBackgroundColor(0xFFFFFFFF);
        int pad = (int) (90 * getResources().getDisplayMetrics().density);
        splash.setPadding(pad, pad, pad, pad);
        root.addView(splash, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);

        web.setWebViewClient(new SplashClient());
        web.setWebChromeClient(new WebChromeClient());
        web.loadUrl(URL);

        setContentView(root);
    }

    static class SplashClient extends WebViewClient {
        @Override
        public void onPageFinished(WebView view, String url) {
            Activity a = (Activity) view.getContext();
            if (a instanceof MainActivity) {
                MainActivity m = (MainActivity) a;
                if (m.splash != null && m.root != null) {
                    m.root.removeView(m.splash);
                    m.splash = null;
                }
            }
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) {
                view.loadDataWithBaseURL(null, OFFLINE_HTML, "text/html", "UTF-8", URL);
            }
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && web.canGoBack()) {
            web.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
