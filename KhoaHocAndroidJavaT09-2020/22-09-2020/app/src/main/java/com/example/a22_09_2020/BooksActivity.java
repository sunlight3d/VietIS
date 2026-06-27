package com.example.a22_09_2020;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;

public class BooksActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.books_activity);
        Intent intent = getIntent();
        Integer x = intent.getIntExtra("x", 0);
        String name = intent.getStringExtra("y");
        System.out.println("hhdd");
    }
}