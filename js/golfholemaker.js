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

    /**
     * Set up annecessary bits and pieces
     */
    init: function () {
        this.bindEvents();
    },

    /**
     * Add event listeners to the tool
     */
    bindEvents: function () {
        document.getElementById('file').addEventListener('change', this.handleFileSelect, true);
    },

    /**
     * Handles image loading and passes the result to drawImage()
     * @param event
     */
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

    /**
     * Draws an image onto a canvas and kicks off the processImage method
     * @param image
     */
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

    /**
     * Creates an array of color values from the pixels in the image
     * @param imageData
     */
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

    /**
     * Populate a set of inputs used to specify what type of tile to draw for each color in the processed image
     * @param valueArray
     */
    createColorSelect: function (valueArray) {
        if (allColors.length <= this.settings.colorCountThreshold) {
            // reduce the array to unique values to determine how many colors we are dealing with
            var allColors = _.unique(valueArray);

            // transform allColors into an array of objects for greater flexibility in the template
            for (var i = 0, il = allColors.length; i < il; i++) {
                allColors[i] = {
                    hex: allColors[i],
                    short: i
                }
            };

            // render the color/tile type selection form
            var compiledTemplate = _.template(this.templates.colorPicker);
            this.settings.colorPickerContainer.innerHTML = compiledTemplate({colors: allColors});
        } else {
            alert('image has too many colors');
        }
    },

    /**
     * Convert an integer into equivalent hexadecimal with leading zero
     * @param {int} component
     * @returns {string}
     */
    componentToHex: function (component) {
        var hex = component.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },

    /**
     * Create a hexadecimal color from input rgb values
     * @param {int} r - red component of color to convert
     * @param {int} g - green component of color to convert
     * @param {int} b - blue component of color to convert
     * @returns {string} color as hexadecimal
     */
    rgbToHex: function (r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }
};

// start the tool
golfHoleMaker.init();
