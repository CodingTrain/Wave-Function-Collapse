let ui_div = undefined
let ui_line_div = undefined

function start_ui() {
    ui_div = createDiv()
    ui_div.position(width + 20, 20)
    ui_div.style('background:white')
    ui_div.style('width:300px')
    ui_div.style('height:400px')
    ui_div.style('padding:20px')
}

function start_ui_line() {
    ui_line_div = createDiv()
    ui_line_div.parent(ui_div)
    ui_line_div.style('padding:4px')
}

function add_ui_to_line(elem) {
    elem.parent(ui_line_div)
    return elem
}

function createUI() {
    start_ui()

    start_ui_line()

    add_ui_to_line(createSpan("<h3>Image Generation</h3>"))
    start_ui_line()

    let imageSelect = add_ui_to_line(createSelect())
    imageSelect.option('Choose a tile set')
    for (key of loaders.keys()) {
        imageSelect.option(key)
    }
    imageSelect.input(function() {
        let key = imageSelect.selected()
        let imgDesc = loaders.get(key)
        if (imgDesc != undefined)
            imgDesc.load()
    })

    let restartButton = add_ui_to_line(createButton('Restart'))
    restartButton.mouseClicked(start)

    start_ui_line()

    let allowTileRotationCheck = add_ui_to_line(createCheckbox('Generate tile rotations', true))
    allowTileRotationCheck.mouseClicked(function(){
        enableTileRotations(allowTileRotationCheck.checked())
        let key = imageSelect.selected()
        let imgDesc = loaders.get(key)
        if (imgDesc != undefined)
            imgDesc.load()
    })

    start_ui_line()

    let useTileFrequenciesCheck = add_ui_to_line(createCheckbox('Use tile frequencies', true))
    useTileFrequenciesCheck.mouseClicked(function(){
        enableTileFrequencies(useTileFrequenciesCheck.checked())
    })

    start_ui_line()

    add_ui_to_line(createSpan("<h3>Debug Helpers</h3>"))

    start_ui_line()

    let showNeighborsCheck = add_ui_to_line(createCheckbox('Show tile neighbors'))
    showNeighborsCheck.mouseClicked(function(){
        enableDrawTileOptions(showNeighborsCheck.checked())
        loop()
    })

    let showNeighborsLabel = add_ui_to_line(createSpan('Showing tile #1   '))
    let prevDrawTileButton = add_ui_to_line(createButton('<'))
    prevDrawTileButton.mouseClicked(function() {
        changeDrawnTileOptions(-1)
        showNeighborsLabel.html(`Showing tile #${drawnTileIndex+1}   `)
    })

    let nextDrawTileButton = add_ui_to_line(createButton('>'))
    nextDrawTileButton.mouseClicked(function() {
        changeDrawnTileOptions(1)
        showNeighborsLabel.html(`Showing tile #${drawnTileIndex+1}   `)
    })

    start_ui_line()

    let showEdgesCheck = add_ui_to_line(createCheckbox('Show unique tile edges'))
    showEdgesCheck.mouseClicked(function(){
        enableDrawEdges(showEdgesCheck.checked())
        loop()
    })

    start_ui_line()

    let logCellOptionsCheck = add_ui_to_line(createCheckbox('Log the options of a clicked cell'))
    logCellOptionsCheck.mouseClicked(function(){
        enableLogCellOptions(logCellOptionsCheck.checked())
    })
}
