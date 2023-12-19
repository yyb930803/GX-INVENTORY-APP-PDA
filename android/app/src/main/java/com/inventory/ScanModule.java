package com.inventory;

import android.content.Context;
import android.os.Bundle;

import com.example.iscandemo.iScanInterface;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class ScanModule extends ReactContextBaseJavaModule {

    public ScanModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ScanModule";
    }

    @ReactMethod
    public void lock() {
        MainActivity mainActivity = (MainActivity) getCurrentActivity();
        mainActivity.lock();
    }

    @ReactMethod
    public void unlock() {
        MainActivity mainActivity = (MainActivity) getCurrentActivity();
        mainActivity.unlock();
    }

    @ReactMethod
    public void delay(int val) {
        MainActivity mainActivity = (MainActivity) getCurrentActivity();
        mainActivity.delay(val);
    }

    @ReactMethod
    public void enableBeep(boolean enable) {
        MainActivity mainActivity = (MainActivity) getCurrentActivity();
        mainActivity.enableBeep(enable);
    }
}