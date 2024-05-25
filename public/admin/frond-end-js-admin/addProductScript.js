


// const image = document.getElementById('productImage1');
// const cropper = new Cropper(image,{
//   aspectRatio: 1,
// });
// document.querySelector("#btn-crop").addEventListener("click",function(){
//   var croppedImage = cropper.getCroppedCanvas().toDataURL("image/png");
// document.getElementById('output').src = croppedImage;
// document.querySelector(".").style.display = 'flex';
// })
function previewImage(event, imagePreviewId) {
    var reader = new FileReader();
    reader.onload = function() {
      var imagePreview = document.getElementById(imagePreviewId);
      imagePreview.innerHTML = '<img src="' + reader.result + '" class="img-fluid" />';
    };
    reader.readAsDataURL(event.target.files[0]);
  }
  
  document.addEventListener("DOMContentLoaded", function() {
      const image = document.getElementById('productImage1');
      const cropper = new Cropper(image, {
          aspectRatio: 1,
      });
  
      document.querySelector("#btn-crop").addEventListener("click", function() {
          var croppedImage = cropper.getCroppedCanvas().toDataURL("image/png");
          document.getElementById('output').src = croppedImage;
      });
  });
  