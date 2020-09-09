package com.example.mvvmexample01.repositories;

import com.example.mvvmexample01.models.Place;

import java.util.ArrayList;

public class PlaceRepository {
    private static PlaceRepository instance;
    private ArrayList<Place> places = new ArrayList<>();
    private PlaceRepository() {

    }
}
