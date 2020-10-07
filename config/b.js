let accordionMenu2 = function (menuObj) {
    let parentMenu = document.getElementById("accordion2");

    //clear previous submenu
    $('#accordion2').empty();

    if (!menuObj.Level2) {
        //create level one menu
        menuObj.Level1.forEach(function (ele) {
            menuSecond("No Level1", ele)
        });
    } else {
        //create level one menu
        menuObj.Level1.forEach(async function (e1, i) {
            await menuFirsL(e1);
            menuObj.Level2[i].forEach(function (e2){
                menuSecond(e1, e2);
            })
        });
    }

    function menuFirsL(firstL) {
        let panelDefault1 = document.createElement("div");
        panelDefault1.className = "Menu panel panel-info " + firstL;

        let panelHeading1 = document.createElement("div");
        panelHeading1.className = "panel-heading";

        let panelTitle1 = document.createElement("h4");
        panelTitle1.className = "panel-title";

        let collapsed1 = document.createElement("a");
        collapsed1.className = "collapsed";
        collapsed1.setAttribute("data-toggle", "collapse");
        collapsed1.setAttribute("data-parent", "#accordion2");
        collapsed1.href = "#" + firstL;

        let firstLayerName = document.createTextNode(firstL + "  ");
        firstLayerName.className = "menuwords";

        let collapseOne = document.createElement("div");
        collapseOne.className = "panel-collapse collapse";
        collapseOne.id = firstL;

        let panelBody1 = document.createElement("div");
        panelBody1.className = "panel-body";

        let panelGroup1 = document.createElement("div");
        panelGroup1.className = "panel-group " + firstL;
        panelGroup1.id = "nested-" + firstL;

        collapsed1.appendChild(firstLayerName);
        panelTitle1.appendChild(collapsed1);
        panelHeading1.appendChild(panelTitle1);
        panelDefault1.appendChild(panelHeading1);

        panelBody1.appendChild(panelGroup1);
        collapseOne.appendChild(panelBody1);
        panelDefault1.appendChild(collapseOne);

        parentMenu.appendChild(panelDefault1);
    }

    function menuSecond(firstL, secondL) {
        let checkboxDiv = document.createElement("div");
        // checkboxDiv.className = "Menu " + thirdReplace + " " + countryNameStr + " " + stateNameStr + " " + cityNameStr;
        checkboxDiv.className = "Menu "

        let checkboxH4 = document.createElement("h4");
        let checkboxA = document.createElement("a");
        let checkboxAt = document.createTextNode(secondL + "   ");
        checkboxA.className = "menuWords";

        let checkboxLabel = document.createElement("label");
        checkboxLabel.className = "switch right";

        let checkboxInput = document.createElement("input");
        checkboxInput.type = "checkbox";
        // checkboxInput.className = element.LayerType + " input";
        checkboxInput.className = "input";
        // checkboxInput.setAttribute("value", element.LayerName);

        let checkboxSpan = document.createElement("span");
        checkboxSpan.className = "slider round";

        checkboxA.appendChild(checkboxAt);
        checkboxH4.appendChild(checkboxA);
        checkboxLabel.appendChild(checkboxInput);
        checkboxLabel.appendChild(checkboxSpan);
        checkboxH4.appendChild(checkboxLabel);
        checkboxDiv.appendChild(checkboxH4);

        // document.getElementById(element.FirstLayer + "--" + element.SecondLayer).appendChild(checkboxDiv);
        if (firstL === "No Level1") {
            parentMenu.appendChild(checkboxDiv);
        } else {
            document.getElementById("nested-" + firstL).appendChild(checkboxDiv);
        }
    }
};