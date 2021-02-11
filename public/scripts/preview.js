$(() => {
  $('button#preview').on('click', () => {
    window.open('', 'preview');
    // Select form and form fields
    const form = $('#preview_form');
    let title = form.find('input[name ="title"]');
    let animation = form.find('input[name ="animation"]');
    let photo = form.find('input[name ="photo"]');
    let sound = form.find('input[name ="sound"]');
    let content = form.find('input[name ="content"]');

    // Populate form fields with values
    title.val($('input#title').val());
    let anim_value = $('.anim_buttons input[name=animation]:checked').val();
    animation.val(anim_value);
    let photo_value = $('.suggested_photos input[name=photo]:checked').val();
    photo.val(photo_value);
    let sound_value = $('.sound_buttons input[name=sound]:checked').val();
    sound.val(sound_value);
    let content_value = $('textarea#entry').val();
    content.val(content_value);

    // Submit form
    document.getElementById('preview_form').submit();
  })
})
