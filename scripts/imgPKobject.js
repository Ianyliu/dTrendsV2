define(['./WorldWindShim'],function (WorldWind) {
    let imagePK = function (lat, long,datatype, iconcode,imgSource) {
        //assigns the agroshere url for images to be located
        const  agro_url = "https://worldwind.arc.nasa.gov/agrosphere"
        // wrap up World Wind Placemark object
        let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageSource = agro_url + imgSource;

        placemarkAttributes.imageScale = 1.5; //placemark size!

        placemarkAttributes.imageOffset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.3,
            WorldWind.OFFSET_FRACTION, 0.0);

        placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
        placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 1.0);


        let highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
        highlightAttributes.imageScale = 2;

        let placemarkPosition = new WorldWind.Position(lat, long, 0);

        this.placemark = new WorldWind.Placemark(placemarkPosition, true, placemarkAttributes);
        this.placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        this.placemark.attributes = placemarkAttributes;
        this.placemark.highlightAttributes = highlightAttributes;
    };

    return imagePK


});