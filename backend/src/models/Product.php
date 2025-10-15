<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Product extends Model
{
    protected $table = 'products';
    protected $fillable = [
        'name', 
        'created_by', 
        'description', 
        'image_url',
        'price',
        'stock',

    ];



    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public $timestamps = true;


}