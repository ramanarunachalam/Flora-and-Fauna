function show_bigger_image()
{
    var image_src = arguments[0];
    var caption = arguments[1];

    $("#IMAGE_IN_MODAL").attr("src", image_src)
    $("#IMAGE_MODEL_LABEL").html(caption)
    $('#IMAGE_MODAL').modal();
}

function tree_module_init(data) {
    var template_name = '#card-info-template';
    var ul_template = $(template_name).html();
    var template_html = Mustache.to_html(ul_template, data);
    $('#CARDINFO').html(template_html);
}

