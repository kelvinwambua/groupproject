<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';
    protected $fillable = [
        'name',
        'description',
        'slug'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public $timestamps = true;

    // Relationship with products
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}