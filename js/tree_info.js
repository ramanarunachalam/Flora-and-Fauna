$(document).ready(function()
{
    $('.carousel-item').eq(Math.floor((Math.random() * $('.carousel-item').length))).addClass("active");
    var $img = $('.active img', this)
    $img.attr('src', $img.attr('data_src'))

    $('.carousel').on('slide.bs.carousel', function(){
        var $img = $('.active img', this)
        $img.attr('src', $img.attr('data_src'))

        var $next = $('.active', this).next()
        if ($next != undefined) {
            $next = $('img', $next)
            $next.attr('src', $next.attr('data_src'))
        }
    });

    $('.carousel').carousel({
          pause: "hover",
          interval: 5000
    });
});

