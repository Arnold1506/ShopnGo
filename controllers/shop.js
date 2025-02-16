const Product=require('../models/product');
const Order = require('../models/order'); 

exports.getAccessories = (req, res, next) => {
    Product.find({category:'accessories'})
      .then(products => {
        // console.log(products);
        res.render('shop/products', {
          prods: products,
          pageTitle: 'Accessories',
          path: '/accessories',
          isAuthenticated: req.session.isLoggedIn
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  exports.getClothes = (req, res, next) => {
    Product.find({category:'clothes'})
      .then(products => {
        // console.log(products);
        res.render('shop/products', {
          prods: products,
          pageTitle: 'Clothes',
          path: '/clothes',
          isAuthenticated: req.session.isLoggedIn
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  exports.getIndex = (req, res, next) => {
    Product.find({category:'accessories'})
    .limit(5)
      .then(products => {
        prodac=products;
        Product.find({category:'clothes'}).limit(5)
        .then(prods=>{
          res.render('shop/index', {
            prods: prods,
            prodac:products,
            pageTitle: 'Shop',
            path: '/',
            isAuthenticated: req.session.isLoggedIn,
            isAdmin:req.session.isAdmin
          });
        })
      })
      .catch(err => {
        console.log(err);
      });
  };



  exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
      .then(product => {
        res.render('shop/product-detail', {
          product: product,
          pageTitle: product.title,
          path: '/products',
          isAuthenticated: req.session.isLoggedIn
        });
      })
      .catch(err => console.log(err));
  };
  

  exports.getCart = (req, res, next) => {
    let total=0;
    req.user
      .populate('cart.items.productId')
      // .execPopulate()
      .then(user => {
        const products = user.cart.items;
        products.forEach(p => {
          // console.log(p.productId.title);
          for (let i = 0; i < p.quantity; i++) {
            total+=p.productId.price;
            
          }
        });
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: products,
          total:total,
          isAuthenticated: req.session.isLoggedIn
        });
      })
      .catch(err => console.log(err));
  };
  
  exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
      .then(product => {
        return req.user.addToCart(product);
      })
      .then(result => {
        // console.log(result);
        res.redirect('/cart');
      });
  };
  
  exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
      .removeFromCart(prodId)
      .then(result => {
        res.redirect('/cart');
      })
      .catch(err => console.log(err));
  };
  
  exports.postOrder = (req, res, next) => {
    req.user
      .populate('cart.items.productId')
      // .execPopulate()
      .then(user => {
        const products = user.cart.items.map(i => {
          return { quantity: i.quantity, product: { ...i.productId._doc } };
        });
        const order = new Order({
          user: {
            email: req.user.email,
            userId: req.user
          },
          products: products
        });
        return order.save();
      })
      .then(result => {
        return req.user.clearCart();
      })
      .then(() => {
        res.redirect('/orders');
      })
      .catch(err => console.log(err));
  };
  
  exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
      .then(orders => {
        res.render('shop/orders', {
          path: '/orders',
          pageTitle: 'Your Orders',
          orders: orders,
          isAuthenticated: req.session.isLoggedIn
        });
      })
      .catch(err => console.log(err));
  };
  