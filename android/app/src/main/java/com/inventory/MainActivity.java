package com.inventory;

import android.os.Bundle;
import android.os.IScanListener;
import android.util.Log;
import android.view.KeyEvent;

import com.example.iscandemo.iScanInterface;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "inventory";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the rendered you wish to use (Fabric or the older renderer).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }
  }

  private iScanInterface miScanInterface;

  //数据回调监听
  private IScanListener miScanListener = new IScanListener() {

    /*
     * param data 扫描数据
     * param type 条码类型
     * param decodeTime 扫描时间
     * param keyDownTime 按键按下的时间
     * param imagePath 图片存储地址，通常用于ocr识别需求（需要先开启保存图片才有效）
     */
    @Override
    public void onScanResults(String data, int type, long decodeTime, long keyDownTime,String imagePath) {

      boolean res = false;
      //解码失败
      if(data == null || data.isEmpty()){
        data = "decode error";
        res = true;
      }

      // 更新UI界面
      String finalData = data + "\n";
      boolean finalRes = res;
      runOnUiThread(new Runnable() {
        @Override
        public void run() {
          miScanInterface.lockScanKey(finalRes);
        }
      });
    }
  };

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    //创建iScanInterface实例化对象
    miScanInterface = new iScanInterface(this);

    //注册iScanInterface 数据回调监听
    miScanInterface.registerScan(miScanListener);
  }

  @ReactMethod
  public void lock() {
    miScanInterface.lockScanKey(false);
  }

  @ReactMethod
  public void unlock() {
    miScanInterface.lockScanKey(true);
  }

  @ReactMethod
  public void delay(int val) {
    miScanInterface.setIntervalTime(val);
  }

  @ReactMethod
  public void enableBeep(boolean enable) {
    miScanInterface.enablePlayBeep(enable);
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();

    //注销iScanInterface 数据回调监听
    miScanInterface.unregisterScan(miScanListener);
  }

  @Override
  public boolean onKeyUp(int keyCode, KeyEvent event) {
    if (keyCode != KeyEvent.KEYCODE_BACK) {
      int scanCode = event.getScanCode();

      ReactInstanceManager reactInstanceManager = getReactInstanceManager();
      ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

      if (reactContext != null) {
        CatalystInstance catalystInstance = reactContext.getCatalystInstance();
        DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = catalystInstance.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);

        // Create a WritableMap and put the values
        WritableMap eventData = Arguments.createMap();
        eventData.putInt("keyCode", keyCode);
        eventData.putInt("scanCode", scanCode);

        eventEmitter.emit("onKeyUp", eventData);
      }
    }
    return super.onKeyUp(keyCode, event);
  }

}
