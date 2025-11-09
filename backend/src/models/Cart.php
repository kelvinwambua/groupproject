<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Cart extends Model
{
    protected $table = 'carts';
    protected $fillable = [
        'user_id',        
        'quantity',
        'status',
        'total_price',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function cart_items()
    {
        
        return $this->hasMany(Cart_Item::class, 'cart_id');
    }


    
}