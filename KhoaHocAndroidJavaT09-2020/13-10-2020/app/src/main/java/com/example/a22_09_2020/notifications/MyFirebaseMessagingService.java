package com.example.a22_09_2020.notifications;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.example.a22_09_2020.LoginActivity;
import com.example.a22_09_2020.R;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "MessageService";
    public  static final String CHANNEL_1_ID = "channel1";
    public  static final String CHANNEL_2_ID = "channel2";

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        if (remoteMessage.getData().size() > 0) {
            //co du lieu
            Map<String, String> data = remoteMessage.getData();
            pushRemoteNotification(data);
        }
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d(TAG, "Refreshed token: " + token);
    }
    public void pushRemoteNotification(Map<String, String> data) {
        Context context = this;
        Intent intent = new Intent(context, LoginActivity.class);
        intent.setAction("OK");
        PendingIntent contentIntent = PendingIntent.getActivity(context, 0, intent, 0);
        Intent broadcastIntent = new Intent(context, MyBroadcastReceiver.class);
        broadcastIntent.putExtra("data", "haha");

        PendingIntent actionIntent = PendingIntent.getBroadcast(context, 0, broadcastIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);

        Notification notification = new NotificationCompat.Builder(context, CHANNEL_1_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("Noti noti")
                .setContentText("Name = "+data.get("name")+", age = "+data.get("age"))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setContentIntent(contentIntent)
                .setColor(Color.BLUE)
                .addAction(R.drawable.ic_notification,"OK",
                        actionIntent)
                .build();
        NotificationManagerCompat notificationManager =  NotificationManagerCompat.from(context);
        notificationManager.notify(2, notification);
    }
}
