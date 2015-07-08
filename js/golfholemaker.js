var golfHoleMaker = {

    // values we need access to
    valueArray: [],
    imageWidth: 0,

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
            '<input value="<%= i %>" type="text" length="1" id="color-<%= colors[i].hex.replace("#", "") %>"/>' +
            '</li>\n' +
            '<% } %>' +
            '</ul>' +
            '<button id="generateHoleString">Generate</button>'
    },

    /**
     * Set up any necessary bits and pieces
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

                this.imageWidth = image.width;

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
        this.valueArray = [];

        for (var i = 0, il = imageData.data.length; i < il; i += 4) {
            var red = imageData.data[i];
            var green = imageData.data[i + 1];
            var blue = imageData.data[i + 2];

            this.valueArray.push(this.rgbToHex(red, green, blue));
        }

        this.createColorSelect();
    },

    /**
     * Populate a set of inputs used to specify what type of tile to draw for each color in the processed image
     * @param valueArray
     */
    createColorSelect: function () {
        // reduce the array to unique values to determine how many colors we are dealing with
        var allColors = _.unique(this.valueArray);

        if (allColors.length <= this.settings.colorCountThreshold) {
            // transform allColors into an array of objects for greater flexibility in the template
            for (var i = 0, il = allColors.length; i < il; i++) {
                allColors[i] = {
                    hex: allColors[i],
                    short: i
                }
            }

            // render the color/tile type selection form
            var compiledTemplate = _.template(this.templates.colorPicker);
            this.settings.colorPickerContainer.innerHTML = compiledTemplate({colors: allColors});
            document.getElementById('generateHoleString').addEventListener('click', this.generateHoleString, true);
        } else {
            alert('image has too many colors');
        }
    },

    generateHoleString: function (event) {
        event.preventDefault();

        var colorMapping = {};
        var colorInputs = golfHoleMaker.settings.colorPickerContainer.querySelectorAll('input[type=text]');

        // populate colorMapping object
        _.each(colorInputs, function(element) {
            colorMapping['#' + element.id.replace('color-', '')] = element.value;
        });

        // replace the hex codes with our single-character codes
        var simplifiedValueArray = _.map(golfHoleMaker.valueArray, function (arg) {
            return colorMapping[arg];
        });

        // we now have a fairly large 1d array
        // chunk it into sections image.width wide
        var targetWidth = golfHoleMaker.imageWidth;

        var finalOutput = [];

        for (var i = 0, il = simplifiedValueArray.length; i < il; i += targetWidth) {
            var chunk = simplifiedValueArray.slice(i, i + targetWidth);
            finalOutput.push(chunk.join(''));
        }

        console.log(finalOutput.join('!') + '!');
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
