package com.example.mvvmexample01.viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.example.mvvmexample01.models.Place;
import com.example.mvvmexample01.repositories.PlaceRepository;

import java.util.List;

public class MainActivityViewModel extends ViewModel {
    private MutableLiveData<List<Place>> places;
    private PlaceRepository placeRepository;
    public LiveData<List<Place>> getPlaces(){
        return places;
    }
    public void init(){
        if(places != null) {
            return;
        }
        placeRepository = PlaceRepository.getInstance();
        places = placeRepository.getPlaces();
    }
}
