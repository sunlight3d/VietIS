package com.example.a22_09_2020;

import android.content.Context;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import adapters.BookAdapter;
import models.Book;
import viewmodels.BooksActivityViewModel;

public class BooksFragment extends Fragment implements  IActivity {
    private RecyclerView bookRecyclerView;
    private BooksActivityViewModel booksActivityViewModel;
    private RecyclerView.Adapter recyclerViewAdapter;
    private View view;
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup viewGroup, @Nullable Bundle savedInstanceState) {
        view = inflater.inflate(R.layout.fragment_books, viewGroup, false);
        setupUI();
        return view;
    }
    @Override
    public void setupUI() {
        bookRecyclerView = view.findViewById(R.id.bookRecyclerView);
        RecyclerView.LayoutManager layoutManager = new LinearLayoutManager(
                //getApplicationContext(),
                view.getContext().getApplicationContext(),
                RecyclerView.VERTICAL,false);
        bookRecyclerView.setLayoutManager(layoutManager);
        booksActivityViewModel = (new ViewModelProvider(this))
                .get(BooksActivityViewModel.class);
        booksActivityViewModel.init();
        BookAdapter bookAdapter = new BookAdapter(
                view.getContext().getApplicationContext(),
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
 }
