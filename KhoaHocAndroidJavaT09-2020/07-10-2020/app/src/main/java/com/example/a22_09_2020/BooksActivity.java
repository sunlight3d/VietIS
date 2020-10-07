package com.example.a22_09_2020;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.widget.LinearLayout;

import java.io.LineNumberReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Observable;

import adapters.BookAdapter;
import models.Book;
import viewmodels.BooksActivityViewModel;

public class BooksActivity extends AppCompatActivity implements  IActivity {
    private RecyclerView bookRecyclerView;
    private BooksActivityViewModel booksActivityViewModel;
    private RecyclerView.Adapter recyclerViewAdapter;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.books_activity);
        setupUI();
        setupActions();

    }

    @Override
    public void setupUI() {
        bookRecyclerView = findViewById(R.id.bookRecyclerView);
        RecyclerView.LayoutManager layoutManager = new LinearLayoutManager(
                getApplicationContext(),
                RecyclerView.VERTICAL,false);
        bookRecyclerView.setLayoutManager(layoutManager);
        booksActivityViewModel = (new ViewModelProvider(this))
                                    .get(BooksActivityViewModel.class);
        booksActivityViewModel.init();
        BookAdapter bookAdapter = new BookAdapter(
                this,
                new ArrayList<Book>()
        );
        booksActivityViewModel.getBooks().observe(this,
                new Observer<List<Book>>() {
                    @Override
                    public void onChanged(List<Book> books) {
                        bookAdapter.setBooks(new ArrayList<>(books));
                        bookAdapter.notifyDataSetChanged();
                    }
                }
        );
        //Call xuong viewmodel
        bookRecyclerView.setAdapter(bookAdapter);
    }

    @Override
    public void setupActions() {

    }

    @Override
    public void onConfigurationChanged(@NonNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) {
            setContentView(R.layout.books_activity_landscape);
        } else if (newConfig.orientation == Configuration.ORIENTATION_PORTRAIT){
            setContentView(R.layout.books_activity);
        }
    }
}