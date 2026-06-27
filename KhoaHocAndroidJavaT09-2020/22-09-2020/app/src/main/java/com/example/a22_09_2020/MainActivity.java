package com.example.a22_09_2020;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import models.User;
import sqlite.Database;
import validations.Validation;

public class MainActivity extends AppCompatActivity
        implements IActivity {
    public static String TAG_MAIN_ACTIVITY = "MainActivity";
    private EditText txtEmail;
    private EditText txtPassword;
    private TextView txtErrorEmail;
    private Button buttonLogin;
    private Boolean isValidEmail = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_activity);
        //map UI to property
        setupUI();
        setupActions();
        //fake
        txtEmail.setText("hoang@gmail.com");
        //sau khi login => luu du lieu bang sqlite
        //validate data: dung regex trong vid tren youtube
    }

    @Override
    public void setupActions() {
        /*
        buttonLogin.setOnClickListener((View view) -> {
            //Log.d(TAG_MAIN_ACTIVITY, "Hello");
            Toast.makeText(this, "Ban bam vao login", Toast.LENGTH_LONG).show();

        });
        */
        buttonLogin.setOnClickListener(new View.OnClickListener() {
             @Override
             public void onClick(View v) {
                 if(MainActivity.this.isValidEmail) {
                     //navigate
                     //intent = segue
                     Intent intent = new Intent(MainActivity.this, BooksActivity.class);
                     intent.putExtra("x", 10);
                     intent.putExtra("y", "Hoang");
                     MainActivity.this.startActivity(intent);
//                     new Database(MainActivity.this).insertUser(
//                             txtEmail.getText().toString(),
//                             "12345457aaa",
//                             "aa1122bb"
//                     );
                     User foundUser = new Database(MainActivity.this).getLoggedInUser();
                     System.out.println("aha");
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