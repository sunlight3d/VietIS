package com.example.mvvmexample01.repositories;

import androidx.lifecycle.MutableLiveData;

import com.example.mvvmexample01.models.Place;

import java.util.ArrayList;
import java.util.List;

public class PlaceRepository {
    private static PlaceRepository instance;
    private ArrayList<Place> places = new ArrayList<>();
    private PlaceRepository() {

    }
    public static PlaceRepository getInstance() {
        if(instance == null) {
            instance = new PlaceRepository();
        }
        return instance;
    }
    public MutableLiveData<List<Place>> getPlaces() {
        MutableLiveData<List<Place>> mutableLiveData = new MutableLiveData<>();
        fetchPlacesFromApi();
        mutableLiveData.setValue(places);
        return mutableLiveData;
    }
    private void fetchPlacesFromApi() {
        places = new ArrayList<>();
        places.add(new Place("Venice, Italy", "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/hbz-venice-gettyimages-489741024-1505338894.jpg"));
        places.add(new Place("Pitons, St Lucia", "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/st-lucia-154917524-1494616323.jpg"));
        places.add(new Place("Oia, Santorini, Greece", "https://hips.hearstapps.com/hbz.h-cdn.co/assets/16/16/1461265325-santorini-gettyimages-107741204.jpg"));
        places.add(new Place("Forbidden City, Beijing, China", "https://hips.hearstapps.com/hbz.h-cdn.co/assets/16/16/gettyimages-116147513.jpg"));
        places.add(new Place("Amalfi Coast, Italy", "https://hips.hearstapps.com/hbz.h-cdn.co/assets/16/16/1280x1919/gallery-gettyimages-159582943-1.jpg"));
        places.add(new Place("Fiordland National Park, New Zealand", "https://hips.hearstapps.com/hbz.h-cdn.co/assets/16/16/new-zealand.jpg"));
        places.add(new Place("Sheikh Zayed Grand Mosque, Abu Dhabi, UAE", "https://hips.hearstapps.com/hbz.h-cdn.co/assets/16/16/abu-dhabi-gettyimages-487888511_1.jpg"));
        places.add(new Place("Paris, France", "https://hips.hearstapps.com/hbz.h-cdn.co/assets/16/16/1461268850-paris-gettyimages-182176376.jpg"));
        places.add(new Place("Zlatni Rat, Croatia", "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/croatia-hvar-island-bol-aerial-view-at-the-zlatni-royalty-free-image-1571860455.jpg"));
        places.add(new Place("Lofoten Islands, Norway", "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/aerial-view-of-lofoten-islands-in-norway-royalty-free-image-1571860561.jpg"));
        places.add(new Place("Key West, Florida", "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/wooden-signs-royalty-free-image-1571861059.jpg"));
        places.add(new Place("Comino Island, Malta", "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/deck-chairs-on-rocks-by-sea-against-clear-blue-sky-royalty-free-image-1571861100.jpg"));
        places.add(new Place("Miho no Matsubara, Japan", "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/miho-no-matsubara-beach-and-fuji-san-in-twilight-royalty-free-image-1571860640.jpg"));
        places.add(new Place("Barcelona, Spain", "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/barcelona-parc-guell-at-sunset-royalty-free-image-1571860792.jpg"));
        places.add(new Place("ATACAMA DESERT, CHILE", "https://tr-images.condecdn.net/image/OOKLMo9wDEq/crop/1620/f/arashiyama-bamboo-grove-japan-gettyimages-687644524.jpg"));
        places.add(new Place("ARASHIYAMA BAMBOO GROVE, JAPAN", "https://tr-images.condecdn.net/image/N4bgjrXRqyP/crop/1620/f/avenue-of-the-baobabs-madagascar-gettyimages-1162130992.jpg"));
        places.add(new Place("BANFF NATIONAL PARK, CANADA", "https://tr-images.condecdn.net/image/ZkoLZqXrqW9/crop/1620/f/boracay-philippines-gettyimages-657020958.jpg"));
        places.add(new Place("BOULDERS BEACH, SOUTH AFRICA", "https://tr-images.condecdn.net/image/KzKGak2zPQ9/crop/1620/f/cabo-san-lucas-mexico-gettyimages-531129551.jpg"));
        places.add(new Place("CABO SAN LUCAS, MEXICO", "https://tr-images.condecdn.net/image/KnDrdeOMda3/crop/1620/f/cappadocia-turkey-gettyimages-500615584.jpg"));
        places.add(new Place("CAPPADOCIA, TURKEY", "https://tr-images.condecdn.net/image/Kj0MzpPg5OY/crop/1620/f/cliffs-of-moher-ireland-gettyimages-1015452504.jpg"));
        places.add(new Place("DENALI NATIONAL PARK, ALASKA", "https://tr-images.condecdn.net/image/zkL2eY7Egmx/crop/1620/f/disko-bay-greenland-gettyimages-861851090.jpg"));
        places.add(new Place("DISKO BAY, GREENLAND", "https://tr-images.condecdn.net/image/z81MYR51L0v/crop/1620/f/galapagos-islands-ecuador-gettyimages-651352122.jpg"));
        places.add(new Place("GALÁPAGOS ISLANDS, ECUADOR", "https://tr-images.condecdn.net/image/A1gXb4MvkK6/crop/1620/f/grand-canyon-arizona-gettyimages-104144229.jpg"));
        places.add(new Place("FERNANDO DE NORONHA, BRAZIL", "https://tr-images.condecdn.net/image/KAZ4k2XRjAy/crop/1620/f/halong-bay-vietnam-gettyimages-624488348.jpg"));
        places.add(new Place("The magical Isle of Skye is the stuff dreams", "https://tr-images.condecdn.net/image/e2qBmn2No2a/crop/1620/f/lake-baikal-russia-gettyimages-956886404.jpg"));
        places.add(new Place("LAKE BAIKAL, RUSSIA", "https://tr-images.condecdn.net/image/9x4y2pxWwke/crop/1620/f/lake-tekapo-new-zealand-gettyimages-465993201.jpg"));
        places.add(new Place("LAKE TEKAPO, NEW ZEALAND", "https://tr-images.condecdn.net/image/Y9rdZ10KVYm/crop/1620/f/laguna-colorada-bolivia-gettyimages-806975844.jpg"));
        places.add(new Place("LAGUNA COLORADA, BOLIVIA", "https://tr-images.condecdn.net/image/DlD3OelAVYG/crop/1620/f/machu-picchu-peru-gettyimages-1046485040.jpg"));
        places.add(new Place("MACHU PICCHU, PERU", "https://tr-images.condecdn.net/image/mx85pOv565o/crop/1620/f/milford-sound-new-zealand-gettyimages-640829610.jpg"));
    }
}
