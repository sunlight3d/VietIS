package com.example.a22_09_2020;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

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
    public static String TAG_MAIN_ACTIVITY = "MainActivity";
    private EditText txtEmail;
    private EditText txtPassword;
    private TextView txtErrorEmail;
    private Button buttonLogin;
    private Boolean isValidEmail = false;
    private LoginActivityViewModel loginActivityViewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
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