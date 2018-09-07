//import apiConfig from './configfile';
let n=4; // number of movies to be displayed

{
    // Model Controller Block

    //private variables:
    let base_url = 'http://api.themoviedb.org/3/discover/movie?api_key=', movies, imgURLs = new Array();
    let tmdb_api_key = apiConfig.tmdbAPIkey;
    var modelCtrl = {}; 
    
    modelCtrl.getDate = () => {
        // returns complete today's date in string form: YYYY-MM-DD
        let dt = new Date;
        let y = dt.getFullYear();
        let m = dt.getMonth() + 1;
        let d = dt.getDate();
        // add zero to single digit number
        m = m<10?`0${m}`:m;
        d = d<10?`0${d}`:d;
        dt = `${y}-${m}-${d}`;
        return dt;
    }
    
    modelCtrl.numDate = dateString => {
        // converts date of type string into number
        dateString = dateString.replace('-', '').replace('-', '');
        dateString = Number.parseInt(dateString);
        return dateString;
    }

    modelCtrl.getImgURLs = async function() {
        
        try {
            
            let img_conf = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${tmdb_api_key}`);
            img_conf = await img_conf.json();
            let img_base_url = img_conf.images.secure_base_url;
            let img_size = img_conf.images.poster_sizes[4];
            let img = img_base_url + img_size;
            // store the complete poster url in array
            for(let i=0; i<20; i++) {
                imgURLs[i] = img + movies.results[i].poster_path;
            }
            return imgURLs;
            
        } catch(err) {
            console.log(`Error in getting image configuration: \n${err}`);
        }
    };
        
    modelCtrl.getMovies = async function() {
        try {
            let d = modelCtrl.getDate();
            console.log(d);
            movies = await fetch(`${base_url}${tmdb_api_key}&release_date.gte=${d}&sort_by=release_date.asc&region=US`);
            movies = await movies.json();
            return movies;
        } catch(err) {
            console.log(`Error in fetching movies: \n${err}`);
        }
    };
    
    // end model block
}

{
    
    // UI Controller Block
    var uiCtrl = {};
    let txt, pos;
    
    uiCtrl.displayMovies = function (movies, imgURLs) {
        txt = document.querySelector('.slideshow-text').children;
        pos = document.querySelector('.slider').children;
        for(let i=0, j=0; j<n; i++) {
            
            let mn = modelCtrl.numDate(movies.results[i].release_date);
            let dn = modelCtrl.numDate(modelCtrl.getDate());
            
            if(mn >= dn) {
                txt[j].textContent = movies.results[i].title/* + " " + movies.results[i].release_date*/;
                pos[j].firstElementChild.src = imgURLs[i];
                j++;
            }
        }
    }
    
   // end ui block 
}

{
    
    var addSlickClasses = () => {
        var $slider = $('.slideshow .slider'),
  maxItems = $('.item', $slider).length,
  dragging = false,
  tracking,
  rightTracking;

// alert($slider.maxItems);

$sliderRight = $('.slideshow').clone().addClass('slideshow-right').appendTo($('.split-slideshow'));

rightItems = $('.item', $sliderRight).toArray();
reverseItems = rightItems.reverse();
$('.slider', $sliderRight).html('');
for (i = 0; i < maxItems; i++) {
  $(reverseItems[i]).appendTo($('.slider', $sliderRight));
}

$slider.addClass('slideshow-left');
$('.slideshow-left').slick({
  vertical: true,
  verticalSwiping: true,
  arrows: false,
  infinite: true,
  dots: true,
  speed: 1000,
  cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)'
}).on('beforeChange', function(event, slick, currentSlide, nextSlide) {

  if (currentSlide > nextSlide && nextSlide == 0 && currentSlide == maxItems - 1) {
    $('.slideshow-right .slider').slick('slickGoTo', -1);
    $('.slideshow-text').slick('slickGoTo', maxItems);
  } else if (currentSlide < nextSlide && currentSlide == 0 && nextSlide == maxItems - 1) {
    $('.slideshow-right .slider').slick('slickGoTo', maxItems);
    $('.slideshow-text').slick('slickGoTo', -1);
  } else {
    $('.slideshow-right .slider').slick('slickGoTo', maxItems - 1 - nextSlide);
    $('.slideshow-text').slick('slickGoTo', nextSlide);
  }
}).on("mousewheel", function(event) {
  event.preventDefault();
  if (event.deltaX > 0 || event.deltaY < 0) {
    $(this).slick('slickNext');
  } else if (event.deltaX < 0 || event.deltaY > 0) {
    $(this).slick('slickPrev');
  };
}).on('mousedown touchstart', function(){
  dragging = true;
  tracking = $('.slick-track', $slider).css('transform');
  tracking = parseInt(tracking.split(',')[5]);
  rightTracking = $('.slideshow-right .slick-track').css('transform');
  rightTracking = parseInt(rightTracking.split(',')[5]);
}).on('mousemove touchmove', function(){
  if (dragging) {
    newTracking = $('.slideshow-left .slick-track').css('transform');
    newTracking = parseInt(newTracking.split(',')[5]);
    diffTracking = newTracking - tracking;
    $('.slideshow-right .slick-track').css({'transform': 'matrix(1, 0, 0, 1, 0, ' + (rightTracking - diffTracking) + ')'});
  }
}).on('mouseleave touchend mouseup', function(){
  dragging = false;
});

$('.slideshow-right .slider').slick({
  swipe: false,
  vertical: true,
  arrows: false,
  infinite: true,
  speed: 950,
  cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
  initialSlide: maxItems - 1
});
$('.slideshow-text').slick({
  swipe: false,
  vertical: true,
  arrows: false,
  infinite: true,
  speed: 900,
  cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)'
});
    }
    
}

{
    // Controller Block
    
    let movies, imgURLs = new Array();
    var controller = {};
    
    controller.init = async function() {
 
        movies = await modelCtrl.getMovies();
        
        imgURLs = await modelCtrl.getImgURLs();
        
        uiCtrl.displayMovies(movies, imgURLs);
        
        addSlickClasses();

    };
    
    
    // end controller block
}

controller.init();