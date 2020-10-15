package com.example.a22_09_2020;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.example.a22_09_2020.notifications.MyFirebaseMessagingService;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

import java.util.ArrayList;
import java.util.List;

import adapters.BookAdapter;
import models.Book;
import models.User;
import sqlite.Database;
import validations.Validation;
import viewmodels.BooksActivityViewModel;
import viewmodels.LoginActivityViewModel;

public class LoginActivity extends AppCompatActivity
        implements IActivity {

    public static String TAG = "LoginActivity";
    private EditText txtEmail;
    private EditText txtPassword;
    private TextView txtErrorEmail;
    private Button buttonLogin;
    private Boolean isValidEmail = false;
    private LoginActivityViewModel loginActivityViewModel;

    private void createNotificationChannels() {
        if(Build.VERSION.SDK_INT > Build.VERSION_CODES.O) {
            NotificationChannel channel1 = new NotificationChannel(
                    MyFirebaseMessagingService.CHANNEL_1_ID,
                    "Channel 1",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel1.setDescription("This is channel 1 ");
            NotificationChannel channel2 = new NotificationChannel(
                    MyFirebaseMessagingService.CHANNEL_2_ID,
                    "Channel 2",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel1.setDescription("This is channel 2 ");
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel1);
            manager.createNotificationChannel(channel2);
        }
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FirebaseMessaging.getInstance().setAutoInitEnabled(true);
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(new OnCompleteListener<String>() {
                    @Override
                    public void onComplete(@NonNull Task<String> task) {
                        if (!task.isSuccessful()) {
                            Log.w(TAG, "Fetching FCM registration token failed", task.getException());
                            return;
                        }

                        // Get new FCM registration token
                        String token = task.getResult();

                        // Log and toast
                        String msg = getString(R.string.msg_token_fmt, token);
                        Log.d(TAG, msg);
                        Toast.makeText(LoginActivity.this, msg, Toast.LENGTH_SHORT).show();
                    }
                });

        createNotificationChannels();
        setContentView(R.layout.login_activity);
        //map UI to property
        setupUI();
        txtEmail.setText("hoang1@gmail.com");
        txtPassword.setText("123456");
        setupActions();
        loginActivityViewModel = (new ViewModelProvider(this))
                .get(LoginActivityViewModel.class);
        //check login
        if(Database.getInstance(this).getLoggedInUser() != null) {
            navigateToMainActivity();
        }
    }
    private void navigateToMainActivity(){
        //intent = segue
        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
        this.startActivity(intent);
    }
    private String getEmail() {
        return txtEmail.getText().toString().trim();
    }
    private String getPassword() {
        return txtPassword.getText().toString().trim();
    }
    private void login() {
        loginActivityViewModel.login(getEmail(), getPassword());
        loginActivityViewModel.getUser().observe(this,
                new Observer<User>() {
                    @Override
                    public void onChanged(User user) {
                        String x = user.getEmail();
                        if(user.getEmail().isEmpty()){
                            return;
                        }
                        //Luu sqlite va navigate
                        //viet lai sqlite vi so truong da thay doi

                        new Database(LoginActivity.this).insertUser(
                                txtEmail.getText().toString(),
                                user.getTokenKey(),
                                String.valueOf(user.getId())
                        );
                        LoginActivity.this.navigateToMainActivity();
                    }
                }
        );
    }
    @Override
    public void setupActions() {
        buttonLogin.setOnClickListener(new View.OnClickListener() {
             @Override
             public void onClick(View v) {
                 User foundUser = new Database(LoginActivity.this).getLoggedInUser();
                 if(LoginActivity.this.isValidEmail && foundUser != null) {

                 }else {
                     LoginActivity.this.login();
                 }
             }
         });
        //validate kieu realtime
        txtEmail.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int start, int before, int count) {
                String email = charSequence.toString();
                isValidEmail = Validation.isValidEmail(email);
                txtErrorEmail.setText(isValidEmail == false && !email.isEmpty() ?"Invalid email address" : "");
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });
    }
    @Override
    public void setupUI(){
        txtEmail = findViewById(R.id.txtEmail);
        txtPassword = findViewById(R.id.txtPassword);
        buttonLogin = findViewById(R.id.buttonLogin);
        txtErrorEmail = findViewById(R.id.txtErrorEmail);
    }
}