var golfHoleMaker = {

    settings: {
        holeCanvas: document.querySelector('#hole-canvas'),
        colorPickerContainer: document.querySelector('#color-picker'),
        imageSizeThreshold: 256,
        colorCountThreshold: 8
    },

    templates: {
        colorPicker: '' +
            '<ul>' +
                '<% for(var i = 0, il = colors.length; i < il; i++) { %>' +
                    '<li>' +
                        '<label for="color-<%= colors[i].hex.replace("#", "") %>" style="background-color: <%= colors[i].hex %>">COLOR</label>' +
                        '<input type="text" length="1" id="color-<%= colors[i].hex.replace("#", "") %>"/>' +
                    '</li>\n' +
                '<% } %>' +
            '</ul>'
    },

    init: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        document.getElementById('file').addEventListener('change', this.handleFileSelect, true);
    },

    handleFileSelect: function (event) {
        var file = event.target.files[0];

        var reader = new FileReader();

        reader.onload = function(fileObject) {
            var data = fileObject.target.result;

            var image = new Image();

            image.onload = function() {
                golfHoleMaker.drawImage(this);
            };

            image.src = data;
        };

        reader.readAsDataURL(file);
    },

    drawImage: function (image) {
        var canvas = this.settings.holeCanvas;
        var context = canvas.getContext('2d');

        if(image) {
            if(image.width <= this.settings.imageSizeThreshold && image.height <= this.settings.imageSizeThreshold)

            context.drawImage(image, 0, 0, image.width, image.height);

            golfHoleMaker.processImage(context.getImageData(0, 0, image.width, image.height));
        } else {
            alert('image is too large');
        }
    },

    processImage: function (imageData) {
        var valueArray = [];

        for (var i = 0, il = imageData.data.length; i < il; i += 4) {
            var red = imageData.data[i];
            var green = imageData.data[i + 1];
            var blue = imageData.data[i + 2];

            valueArray.push(this.rgbToHex(red, green, blue));
        }

        this.createColorSelect(valueArray);
    },

    createColorSelect: function (valueArray) {
        // 1) convert the hexes into single characters
        var allColors = _.unique(valueArray);

        if (allColors.length <= this.settings.colorCountThreshold) {

            for (var i = 0, il = allColors.length; i < il; i++) {
                allColors[i] = {
                    hex: allColors[i],
                    short: i
                }
            };

            var compiledTemplate = _.template(this.templates.colorPicker);
            this.settings.colorPickerContainer.innerHTML = compiledTemplate({colors: allColors});
        } else {
            alert('image has too many colors');
        }

    },

    componentToHex: function (component) {
        var hex = component.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },

    rgbToHex: function (r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }
};

golfHoleMaker.init();
