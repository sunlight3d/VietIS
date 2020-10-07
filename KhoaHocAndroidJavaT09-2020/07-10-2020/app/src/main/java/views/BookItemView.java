package views;

import android.net.Uri;
import android.view.View;
import android.widget.ImageView;
import android.widget.RatingBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.a22_09_2020.R;
import com.squareup.picasso.Picasso;

import models.Book;

public class BookItemView extends RecyclerView.ViewHolder {
    private ImageView imageView;
    private TextView textviewName;
    private TextView textviewAuthor;
    private RatingBar ratingBar;
    private TextView textviewDescription;
    private View bottomView;

    private Book book;
    public BookItemView(@NonNull View itemView) {
        super(itemView);
        //map tu file xml sang BookItemView
        imageView = itemView.findViewById(R.id.imageView);
        textviewName = itemView.findViewById(R.id.textViewName);
        textviewAuthor = itemView.findViewById(R.id.textViewAuthor);
        ratingBar = itemView.findViewById(R.id.ratingBar);
        textviewDescription = itemView.findViewById(R.id.textViewDescription);
        bottomView = itemView.findViewById(R.id.bottomView);
    }

    public void setBook(Book book, int position) {
        this.book = book;
        //imageView.setImageURI(Uri.parse(book.getImageUrl()));
        String xx = book.getImageUrl();
        Picasso.get().load(book.getImageUrl())
                .placeholder(R.drawable.ic_launcher_foreground)
                .resize(100, 100)
                .centerCrop()
                .into(imageView);
        textviewName.setText(book.getName());
        textviewAuthor.setText(book.getAuthor());
        ratingBar.setNumStars(book.getRate());
        textviewDescription.setText(book.getDescription());

        bottomView.setBackgroundColor(position % 2 == 0 ?
                itemView.getResources().getColor(R.color.colorRed, null):
                        itemView.getResources().getColor(R.color.colorDodgerBlue, null));
    }
}
