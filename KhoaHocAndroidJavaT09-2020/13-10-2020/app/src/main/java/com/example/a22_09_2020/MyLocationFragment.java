package com.example.a22_09_2020;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import adapters.BookAdapter;
import models.Book;
import viewmodels.BooksActivityViewModel;


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
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;

public class MyLocationFragment extends Fragment implements IActivity {
    private GoogleMap googleMap;
    private SupportMapFragment fragment;

    private View view;


    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup viewGroup, @Nullable Bundle savedInstanceState) {
        try {

            view = inflater.inflate(R.layout.fragment_my_location, viewGroup, false);
            //Android key: AIzaSyCacDm3LHClPTBciYhBHxIMRdBQ0TLPTBI
            //Browser key: AIzaSyBFmNwmL0weEQYu4F0uFmnY8xymnusmTtk
            setupUI();
            return view;
        }catch (Exception e) {
            Log.d("ad", "dddd");
            return null;
        }

    }

    @Override
    public void setupUI() {
        //SupportMapFragment mapFragment = (SupportMapFragment) getFragmentManager().findFragmentById(R.id.map);
        //FragmentManager fm = getChildFragmentManager();
        //fragment = (SupportMapFragment) fm.findFragmentById(R.id.map);
        if (fragment == null) {
            fragment = SupportMapFragment.newInstance();
            fragment.getMapAsync(new OnMapReadyCallback() {
                @Override
                public void onMapReady(GoogleMap googleMap) {
                    LatLng latLng = new LatLng(1.289545, 103.849972);
                    googleMap.addMarker(new MarkerOptions().position(latLng)
                            .title("Singapore"));
                    googleMap.animateCamera(CameraUpdateFactory.newLatLng(latLng));
                }
            });
        }
        getChildFragmentManager().beginTransaction().replace(R.id.map, fragment).commit();

    }

    @Override
    public void onResume() {
        super.onResume();
        if (googleMap == null) {
            fragment.getMapAsync(new OnMapReadyCallback() {
                @Override
                public void onMapReady(GoogleMap googleMap) {
                    MyLocationFragment.this.googleMap.addMarker(new MarkerOptions().position(new LatLng(0, 0)));
                }
            });
        }
    }

    @Override
    public void setupActions() {

    }
}
