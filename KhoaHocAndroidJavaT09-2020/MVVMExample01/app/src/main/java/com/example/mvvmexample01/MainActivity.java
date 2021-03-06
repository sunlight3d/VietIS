package com.example.mvvmexample01;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;

import com.example.mvvmexample01.adapters.RecyclerAdapter;
import com.example.mvvmexample01.models.Place;
import com.example.mvvmexample01.viewmodels.MainActivityViewModel;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private FloatingActionButton floatingActionButton;
    private RecyclerView recyclerView;
    private RecyclerAdapter recyclerAdapter;
    private ProgressBar progressBar;
    private MainActivityViewModel mainActivityViewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        setupUI();
        mainActivityViewModel = (new ViewModelProvider(this)).get(MainActivityViewModel.class);
        mainActivityViewModel.init();
        mainActivityViewModel.getPlaces().observe(this, new Observer<List<Place>>() {
            @Override
            public void onChanged(List<Place> places) {
                recyclerAdapter.notifyDataSetChanged();
            }
        });
        recyclerAdapter = new RecyclerAdapter(this,
                mainActivityViewModel.getPlaces().getValue());
        RecyclerView.LayoutManager layoutManager = new LinearLayoutManager(this);
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.setAdapter(recyclerAdapter);
    }
    public void setupUI() {
        floatingActionButton = findViewById(R.id.floatingActionButton);
        recyclerView = findViewById(R.id.recyclerView);
        progressBar = findViewById(R.id.progressBar);
    }
    private void showProgressBar(){
        progressBar.setVisibility(View.VISIBLE);
    }
    private void hideProgressBar(){
        progressBar.setVisibility(View.GONE);
    }
}