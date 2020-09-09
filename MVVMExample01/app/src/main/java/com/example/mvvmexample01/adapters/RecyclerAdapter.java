package com.example.mvvmexample01.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.RequestOptions;
import com.example.mvvmexample01.R;
import com.example.mvvmexample01.models.Place;

import java.util.List;

public class RecyclerAdapter extends RecyclerView.Adapter<RecyclerAdapter.MyViewHolder> {
    private List<Place> places;
    private Context context;

    public RecyclerAdapter(Context context, List<Place> places) {
        this.places = places;
        this.context = context;
    }
    public static class MyViewHolder extends RecyclerView.ViewHolder {
        public MyViewHolder(View view){
            super(view);

        }
    }


    @NonNull
    @Override
    public RecyclerAdapter.MyViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item, parent);
        return new MyViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MyViewHolder myViewHolder, int position) {
        ImageView imageView = myViewHolder.itemView.findViewById(R.id.imageView);
        TextView txtName = myViewHolder.itemView.findViewById(R.id.txtName);
        Place place = places.get(position);
        txtName.setText(place.getName());
        Glide.with(context)
                .setDefaultRequestOptions(new RequestOptions().error(R.drawable.ic_launcher_background))
                .load( place.getImageUrl())
                .centerCrop()
                .placeholder(R.drawable.ic_launcher_foreground)
                .into(imageView);
    }

    @Override
    public int getItemCount() {
        return places.size();
    }


}
