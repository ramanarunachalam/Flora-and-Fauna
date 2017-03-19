$(document).ready(function(){
    $('.nav li').bind('click', function() {
       $(this).addClass('active').siblings().removeClass('active');
    });
});
