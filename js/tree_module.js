function show_bigger_image()
{
    var image_src = arguments[0];
    var caption = arguments[1];

    $("#IMAGE_IN_MODAL").attr("src", image_src)
    $("#IMAGE_MODEL_LABEL").html(caption)

    $('#IMAGE_MODAL').modal();
}

