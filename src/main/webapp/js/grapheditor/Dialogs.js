/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new open dialog.
 */
var OpenDialog = function()
{
	var iframe = document.createElement('iframe');
	iframe.style.backgroundColor = 'transparent';
	iframe.allowTransparency = 'true';
	iframe.style.borderStyle = 'none';
	iframe.style.borderWidth = '0px';
	iframe.style.overflow = 'hidden';
	iframe.style.maxWidth = '100%';
	iframe.frameBorder = '0';
	
	var dx = 0;
	iframe.setAttribute('width', (((Editor.useLocalStorage) ? 640 : 320) + dx) + 'px');
	iframe.setAttribute('height', (((Editor.useLocalStorage) ? 480 : 220) + dx) + 'px');
	iframe.setAttribute('src', OPEN_FORM);
	
	this.container = iframe;
};

/**
 * Constructs a new color dialog.
 */
var ColorDialog = function(editorUi, color, apply, cancelFn)
{
	this.editorUi = editorUi;
	
	var input = document.createElement('input');
	input.style.marginBottom = '10px';
	
	// Required for picker to render in IE
	if (mxClient.IS_IE)
	{
		input.style.marginTop = '10px';
		document.body.appendChild(input);
	}

	var applyFunction = (apply != null) ? apply : this.createApplyFunction();
	
	function doApply()
	{
		var color = input.value;
		
		// Blocks any non-alphabetic chars in colors
		if (/(^#?[a-zA-Z0-9]*$)/.test(color))
		{
			if (color != 'none' && color.charAt(0) != '#')
			{
				color = '#' + color;
			}

			ColorDialog.addRecentColor((color != 'none') ? color.substring(1) : color, 12);
			applyFunction(color);
			editorUi.hideDialog();
		}
		else
		{
			editorUi.handleError({message: mxResources.get('invalidInput')});	
		}
	};
	
	this.init = function()
	{
		if (!mxClient.IS_TOUCH)
		{
			input.focus();
		}
	};

	var picker = new mxJSColor.color(input);
	picker.pickerOnfocus = false;
	picker.showPicker();

	var div = document.createElement('div');
	mxJSColor.picker.box.style.position = 'relative';
	mxJSColor.picker.box.style.width = '230px';
	mxJSColor.picker.box.style.height = '100px';
	mxJSColor.picker.box.style.paddingBottom = '10px';
	div.appendChild(mxJSColor.picker.box);

	var center = document.createElement('center');
	
	function createRecentColorTable()
	{
		var table = addPresets((ColorDialog.recentColors.length == 0) ? ['FFFFFF'] :
					ColorDialog.recentColors, 11, 'FFFFFF', true);
		table.style.marginBottom = '8px';
		
		return table;
	};
	
	var addPresets = mxUtils.bind(this, function(presets, rowLength, defaultColor, addResetOption)
	{
		rowLength = (rowLength != null) ? rowLength : 12;
		var table = document.createElement('table');
		table.style.borderCollapse = 'collapse';
		table.setAttribute('cellspacing', '0');
		table.style.marginBottom = '20px';
		table.style.cellSpacing = '0px';
		table.style.marginLeft = '1px';
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);

		var rows = presets.length / rowLength;
		
		for (var row = 0; row < rows; row++)
		{
			var tr = document.createElement('tr');
			
			for (var i = 0; i < rowLength; i++)
			{
				(mxUtils.bind(this, function(clr)
				{
					var td = document.createElement('td');
					td.style.border = '0px solid black';
					td.style.padding = '0px';
					td.style.width = '16px';
					td.style.height = '16px';
					
					if (clr == null)
					{
						clr = defaultColor;
					}

					if (clr != null)
					{
						td.style.borderWidth = '1px';

						if (clr == 'none')
						{
							td.style.background = 'url(\'' + Dialog.prototype.noColorImage + '\')';
						}
						else
						{
							td.style.backgroundColor = '#' + clr;
						}

						var name = this.colorNames[clr.toUpperCase()];

						if (name != null)
						{
							td.setAttribute('title', name);
						}
					}
					
					tr.appendChild(td);

					if (clr != null)
					{
						td.style.cursor = 'pointer';
						
						mxEvent.addListener(td, 'click', function()
						{
							if (clr == 'none')
							{
								picker.fromString('ffffff');
								input.value = 'none';
							}
							else
							{
								picker.fromString(clr);
							}
						});
						
						mxEvent.addListener(td, 'dblclick', doApply);
					}
				}))(presets[row * rowLength + i]);
			}
			
			tbody.appendChild(tr);
		}
		
		if (addResetOption)
		{
			var td = document.createElement('td');
			td.setAttribute('title', mxResources.get('reset'));
			td.style.border = '1px solid black';
			td.style.padding = '0px';
			td.style.width = '16px';
			td.style.height = '16px';
			td.style.backgroundImage = 'url(\'' + Dialog.prototype.closeImage + '\')';
			td.style.backgroundPosition = 'center center';
			td.style.backgroundRepeat = 'no-repeat';
			td.style.cursor = 'pointer';
			
			tr.appendChild(td);

			mxEvent.addListener(td, 'click', function()
			{
				ColorDialog.resetRecentColors();
				table.parentNode.replaceChild(createRecentColorTable(), table);
			});
		}
		
		center.appendChild(table);
		
		return table;
	});

	div.appendChild(input);

	if (!mxClient.IS_IE && !mxClient.IS_IE11)
	{
		input.style.width = '182px';

		var clrInput = document.createElement('input');
		clrInput.setAttribute('type', 'color');
		clrInput.style.position = 'relative';
		clrInput.style.visibility = 'hidden';
		clrInput.style.top = '10px';
		clrInput.style.width = '0px';
		clrInput.style.height = '0px';
		clrInput.style.border = 'none';
		
		div.style.whiteSpace = 'nowrap';
		div.appendChild(clrInput);

		var dropperBtn = mxUtils.button('', function()
		{
			// LATER: Check if clrInput is expanded
			if (document.activeElement == clrInput)
			{
				input.focus();
			}
			else
			{
				clrInput.value = '#' + input.value;
				clrInput.click();
			}
		});

		var dropper = document.createElement('img');
		dropper.src = Editor.colorDropperImage;
		dropper.className = 'geAdaptiveAsset';
		dropper.style.position = 'relative';
		dropper.style.verticalAlign = 'middle';
		dropper.style.width = 'auto';
		dropper.style.height = '14px';

		dropperBtn.appendChild(dropper);
		div.appendChild(dropperBtn);

		mxEvent.addListener(clrInput, 'change', function()
		{
			picker.fromString(clrInput.value.substring(1));
		});
	}
	else
	{
		input.style.width = '216px';
	}

	mxUtils.br(div);
	
	// Adds recent colors
	createRecentColorTable();
		
	// Adds presets
	var table = addPresets(this.presetColors);
	table.style.marginBottom = '8px';
	table = addPresets(this.defaultColors);
	table.style.marginBottom = '16px';

	div.appendChild(center);

	var buttons = document.createElement('div');
	buttons.style.textAlign = 'right';
	buttons.style.whiteSpace = 'nowrap';
	
	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
		
		if (cancelFn != null)
		{
			cancelFn();
		}
	});
	cancelBtn.className = 'geBtn';

	if (editorUi.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}
	
	var applyBtn = mxUtils.button(mxResources.get('apply'), doApply);
	applyBtn.className = 'geBtn gePrimaryBtn';
	buttons.appendChild(applyBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}
	
	if (color != null)
	{
		if (color == 'none')
		{
			picker.fromString('ffffff');
			input.value = 'none';
		}
		else
		{
			picker.fromString(color);
		}
	}
	
	div.appendChild(buttons);
	this.picker = picker;
	this.colorInput = input;

	// LATER: Only fires if input if focused, should always
	// fire if this dialog is showing.
	mxEvent.addListener(div, 'keydown', function(e)
	{
		if (e.keyCode == 27)
		{
			editorUi.hideDialog();
			
			if (cancelFn != null)
			{
				cancelFn();
			}
			
			mxEvent.consume(e);
		}
	});
	
	this.container = div;
};

/**
 * Creates function to apply value
 */
ColorDialog.prototype.presetColors = ['E6D0DE', 'CDA2BE', 'B5739D', 'E1D5E7', 'C3ABD0', 'A680B8', 'D4E1F5', 'A9C4EB', '7EA6E0', 'D5E8D4', '9AC7BF', '67AB9F', 'D5E8D4', 'B9E0A5', '97D077', 'FFF2CC', 'FFE599', 'FFD966', 'FFF4C3', 'FFCE9F', 'FFB570', 'F8CECC', 'F19C99', 'EA6B66']; 

/**
 * Creates function to apply value
 */
 ColorDialog.prototype.colorNames = {};

/**
 * Creates function to apply value
 */
ColorDialog.prototype.defaultColors = ['none', 'FFFFFF', 'E6E6E6', 'CCCCCC', 'B3B3B3', '999999', '808080', '666666', '4D4D4D', '333333', '1A1A1A', '000000', 'FFCCCC', 'FFE6CC', 'FFFFCC', 'E6FFCC', 'CCFFCC', 'CCFFE6', 'CCFFFF', 'CCE5FF', 'CCCCFF', 'E5CCFF', 'FFCCFF', 'FFCCE6',
		'FF9999', 'FFCC99', 'FFFF99', 'CCFF99', '99FF99', '99FFCC', '99FFFF', '99CCFF', '9999FF', 'CC99FF', 'FF99FF', 'FF99CC', 'FF6666', 'FFB366', 'FFFF66', 'B3FF66', '66FF66', '66FFB3', '66FFFF', '66B2FF', '6666FF', 'B266FF', 'FF66FF', 'FF66B3', 'FF3333', 'FF9933', 'FFFF33',
		'99FF33', '33FF33', '33FF99', '33FFFF', '3399FF', '3333FF', '9933FF', 'FF33FF', 'FF3399', 'FF0000', 'FF8000', 'FFFF00', '80FF00', '00FF00', '00FF80', '00FFFF', '007FFF', '0000FF', '7F00FF', 'FF00FF', 'FF0080', 'CC0000', 'CC6600', 'CCCC00', '66CC00', '00CC00', '00CC66',
		'00CCCC', '0066CC', '0000CC', '6600CC', 'CC00CC', 'CC0066', '990000', '994C00', '999900', '4D9900', '009900', '00994D', '009999', '004C99', '000099', '4C0099', '990099', '99004D', '660000', '663300', '666600', '336600', '006600', '006633', '006666', '003366', '000066',
		'330066', '660066', '660033', '330000', '331A00', '333300', '1A3300', '003300', '00331A', '003333', '001933', '000033', '190033', '330033', '33001A'];

/**
 * Creates function to apply value
 */
ColorDialog.prototype.createApplyFunction = function()
{
	return mxUtils.bind(this, function(color)
	{
		var graph = this.editorUi.editor.graph;
		
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(this.currentColorKey, color);
			this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [this.currentColorKey],
				'values', [color], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
};

/**
 * 
 */
ColorDialog.recentColors = [];

/**
 * Adds recent color for later use.
 */
ColorDialog.addRecentColor = function(color, max)
{
	if (color != null)
	{
		mxUtils.remove(color, ColorDialog.recentColors);
		ColorDialog.recentColors.splice(0, 0, color);
		
		if (ColorDialog.recentColors.length >= max)
		{
			ColorDialog.recentColors.pop();
		}
	}
};

/**
 * Adds recent color for later use.
 */
ColorDialog.resetRecentColors = function()
{
	ColorDialog.recentColors = [];
};

/**
 * Constructs a new about dialog.
 */
var AboutDialog = function(editorUi)
{
	var div = document.createElement('div');
	div.setAttribute('align', 'center');
	var h3 = document.createElement('h3');
	mxUtils.write(h3, mxResources.get('about') + ' GraphEditor');
	div.appendChild(h3);
	var img = document.createElement('img');
	img.style.border = '0px';
	img.setAttribute('width', '176');
	img.setAttribute('width', '151');
	img.setAttribute('src', IMAGE_PATH + '/logo.png');
	div.appendChild(img);
	mxUtils.br(div);
	mxUtils.write(div, 'Powered by mxGraph ' + mxClient.VERSION);
	mxUtils.br(div);
	var link = document.createElement('a');
	link.setAttribute('href', 'http://www.jgraph.com/');
	link.setAttribute('target', '_blank');
	mxUtils.write(link, 'www.jgraph.com');
	div.appendChild(link);
	mxUtils.br(div);
	mxUtils.br(div);
	var closeBtn = mxUtils.button(mxResources.get('close'), function()
	{
		editorUi.hideDialog();
	});
	closeBtn.className = 'geBtn gePrimaryBtn';
	div.appendChild(closeBtn);
	
	this.container = div;
};

/**
 * Constructs a new textarea dialog.
 */
var TextareaDialog = function(editorUi, title, url, fn, cancelFn, cancelTitle, w, h,
	addButtons, noHide, noWrap, applyTitle, helpLink, customButtons, header)
{
	w = (w != null) ? w : 300;
	h = (h != null) ? h : 120;
	noHide = (noHide != null) ? noHide : false;

	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.top = '20px';
	div.style.bottom = '20px';
	div.style.left = '20px';
	div.style.right = '20px';

	var top = document.createElement('div');

	top.style.position = 'absolute';
	top.style.left = '0px';
	top.style.right = '0px';

	var main = top.cloneNode(false);
	var buttons = top.cloneNode(false);

	top.style.top = '0px';
	top.style.height = '20px';
	main.style.top = '20px';
	main.style.bottom = '64px';
	buttons.style.bottom = '0px';
	buttons.style.height = '60px';
	buttons.style.textAlign = 'center';

	mxUtils.write(top, title);

	div.appendChild(top);
	div.appendChild(main);
	div.appendChild(buttons);

	if (header != null)
	{
		top.appendChild(header);
	}
	
	var nameInput = document.createElement('textarea');
	
	if (noWrap)
	{
		nameInput.setAttribute('wrap', 'off');
	}
	
	nameInput.setAttribute('spellcheck', 'false');
	nameInput.setAttribute('autocorrect', 'off');
	nameInput.setAttribute('autocomplete', 'off');
	nameInput.setAttribute('autocapitalize', 'off');
	
	mxUtils.write(nameInput, url || '');
	nameInput.style.resize = 'none';
	nameInput.style.outline = 'none';
	nameInput.style.position = 'absolute';
	nameInput.style.boxSizing = 'border-box';
	nameInput.style.top = '0px';
	nameInput.style.left = '0px';
	nameInput.style.height = '100%';
	nameInput.style.width = '100%';
	
	this.textarea = nameInput;

	this.init = function()
	{
		nameInput.focus();
		nameInput.scrollTop = 0;
	};

	main.appendChild(nameInput);

	if (helpLink != null)
	{
		var helpBtn = mxUtils.button(mxResources.get('help'), function()
		{
			editorUi.editor.graph.openLink(helpLink);
		});
		helpBtn.className = 'geBtn';
		
		buttons.appendChild(helpBtn);
	}
	
	if (customButtons != null)
	{
		for (var i = 0; i < customButtons.length; i++)
		{
			(function(label, fn, title)
			{
				var customBtn = mxUtils.button(label, function(e)
				{
					fn(e, nameInput);
				});

				if (title != null)
				{
					customBtn.setAttribute('title', title);
				}

				customBtn.className = 'geBtn';
				
				buttons.appendChild(customBtn);
			})(customButtons[i][0], customButtons[i][1], customButtons[i][2]);
		}
	}
	
	var cancelBtn = mxUtils.button(cancelTitle || mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
		
		if (cancelFn != null)
		{
			cancelFn();
		}
	});

	cancelBtn.setAttribute('title', 'Escape');
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}
	
	if (addButtons != null)
	{
		addButtons(buttons, nameInput);
	}
	
	if (fn != null)
	{
		var genericBtn = mxUtils.button(applyTitle || mxResources.get('apply'), function()
		{
			if (!noHide)
			{
				editorUi.hideDialog();
			}
			
			fn(nameInput.value);
		});
		
		genericBtn.setAttribute('title', 'Ctrl+Enter');
		genericBtn.className = 'geBtn gePrimaryBtn';
		buttons.appendChild(genericBtn);

		mxEvent.addListener(nameInput, 'keypress', function(e)
		{
			if (e.keyCode == 13 && mxEvent.isControlDown(e))
			{
				genericBtn.click();
			}
		});
	}
	
	if (!editorUi.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}

	this.container = div;
};

/**
 * Constructs a new edit file dialog.
 */
var EditDiagramDialog = function(editorUi)
{
	var div = document.createElement('div');
	div.style.textAlign = 'right';
	var textarea = document.createElement('textarea');
	textarea.setAttribute('wrap', 'off');
	textarea.setAttribute('spellcheck', 'false');
	textarea.setAttribute('autocorrect', 'off');
	textarea.setAttribute('autocomplete', 'off');
	textarea.setAttribute('autocapitalize', 'off');
	textarea.style.overflow = 'auto';
	textarea.style.resize = 'none';
	textarea.style.width = '600px';
	textarea.style.height = '360px';
	textarea.style.marginBottom = '16px';
	
	textarea.value = mxUtils.getPrettyXml(editorUi.editor.getGraphXml());
	div.appendChild(textarea);
	
	this.init = function()
	{
		textarea.focus();
	};
	
	// Enables dropping files
	if (Graph.fileSupport)
	{
		function handleDrop(evt)
		{
		    evt.stopPropagation();
		    evt.preventDefault();
		    
		    if (evt.dataTransfer.files.length > 0)
		    {
    			var file = evt.dataTransfer.files[0];
    			var reader = new FileReader();
				
				reader.onload = function(e)
				{
					textarea.value = e.target.result;
				};
				
				reader.readAsText(file);
    		}
		    else
		    {
		    	textarea.value = editorUi.extractGraphModelFromEvent(evt);
		    }
		};
		
		function handleDragOver(evt)
		{
			evt.stopPropagation();
			evt.preventDefault();
		};

		// Setup the dnd listeners.
		textarea.addEventListener('dragover', handleDragOver, false);
		textarea.addEventListener('drop', handleDrop, false);
	}
	
	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		div.appendChild(cancelBtn);
	}
	
	var select = document.createElement('select');
	select.style.width = '196px';
	select.className = 'geBtn';

	if (editorUi.editor.graph.isEnabled())
	{
		var replaceOption = document.createElement('option');
		replaceOption.setAttribute('value', 'replace');
		mxUtils.write(replaceOption, mxResources.get('replaceExistingDrawing'));
		select.appendChild(replaceOption);
	}

	var newOption = document.createElement('option');
	newOption.setAttribute('value', 'new');
	mxUtils.write(newOption, mxResources.get('openInNewWindow'));
	
	if (EditDiagramDialog.showNewWindowOption)
	{
		select.appendChild(newOption);
	}

	if (editorUi.editor.graph.isEnabled())
	{
		var importOption = document.createElement('option');
		importOption.setAttribute('value', 'import');
		mxUtils.write(importOption, mxResources.get('addToExistingDrawing'));
		select.appendChild(importOption);
	}

	div.appendChild(select);

	var okBtn = mxUtils.button(mxResources.get('ok'), function()
	{
		// Removes all illegal control characters before parsing
		var data = Graph.zapGremlins(mxUtils.trim(textarea.value));
		var error = null;
		
		if (select.value == 'new')
		{
			editorUi.hideDialog();
			editorUi.editor.editAsNew(data);
		}
		else if (select.value == 'replace')
		{
			try
			{
				editorUi.replaceDiagramData(data);
				editorUi.hideDialog();
			}
			catch (e)
			{
				error = e;
			}
		}
		else if (select.value == 'import')
		{
			editorUi.editor.graph.model.beginUpdate();
			try
			{
				var doc = mxUtils.parseXml(data);
				var model = new mxGraphModel();
				var codec = new mxCodec(doc);
				codec.decode(doc.documentElement, model);
				
				var children = model.getChildren(model.getChildAt(model.getRoot(), 0));
				editorUi.editor.graph.setSelectionCells(editorUi.editor.graph.importCells(children));
				
				// LATER: Why is hideDialog between begin-/endUpdate faster?
				editorUi.hideDialog();
			}
			catch (e)
			{
				error = e;
			}
			finally
			{
				editorUi.editor.graph.model.endUpdate();				
			}
		}
			
		if (error != null)
		{
			mxUtils.alert(error.message);
		}
	});
	okBtn.className = 'geBtn gePrimaryBtn';
	div.appendChild(okBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		div.appendChild(cancelBtn);
	}

	this.container = div;
};

/**
 * 
 */
EditDiagramDialog.showNewWindowOption = true;

/**
 * Constructs a new export dialog.
 */
var ExportDialog = function(editorUi)
{
	var graph = editorUi.editor.graph;
	var bounds = graph.getGraphBounds();
	var scale = graph.view.scale;
	
	var width = Math.ceil(bounds.width / scale);
	var height = Math.ceil(bounds.height / scale);

	var row, td;
	
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	table.setAttribute('cellpadding', (mxClient.IS_SF) ? '0' : '2');
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	td.style.width = '100px';
	mxUtils.write(td, mxResources.get('filename') + ':');
	
	row.appendChild(td);
	
	var nameInput = document.createElement('input');
	nameInput.setAttribute('value', editorUi.editor.getOrCreateFilename());
	nameInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(nameInput);
	row.appendChild(td);
	
	tbody.appendChild(row);
		
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('format') + ':');
	
	row.appendChild(td);
	
	var imageFormatSelect = document.createElement('select');
	imageFormatSelect.style.width = '180px';

	var pngOption = document.createElement('option');
	pngOption.setAttribute('value', 'png');
	mxUtils.write(pngOption, mxResources.get('formatPng'));
	imageFormatSelect.appendChild(pngOption);

	var gifOption = document.createElement('option');
	
	if (ExportDialog.showGifOption)
	{
		gifOption.setAttribute('value', 'gif');
		mxUtils.write(gifOption, mxResources.get('formatGif'));
		imageFormatSelect.appendChild(gifOption);
	}
	
	var jpgOption = document.createElement('option');
	jpgOption.setAttribute('value', 'jpg');
	mxUtils.write(jpgOption, mxResources.get('formatJpg'));
	imageFormatSelect.appendChild(jpgOption);

	if (!editorUi.printPdfExport)
	{
		var pdfOption = document.createElement('option');
		pdfOption.setAttribute('value', 'pdf');
		mxUtils.write(pdfOption, mxResources.get('formatPdf'));
		imageFormatSelect.appendChild(pdfOption);
	}

	var svgOption = document.createElement('option');
	svgOption.setAttribute('value', 'svg');
	mxUtils.write(svgOption, mxResources.get('formatSvg'));
	imageFormatSelect.appendChild(svgOption);
	
	if (ExportDialog.showXmlOption)
	{
		var xmlOption = document.createElement('option');
		xmlOption.setAttribute('value', 'xml');
		mxUtils.write(xmlOption, mxResources.get('formatXml'));
		imageFormatSelect.appendChild(xmlOption);
	}

	td = document.createElement('td');
	td.appendChild(imageFormatSelect);
	row.appendChild(td);
	
	tbody.appendChild(row);
	
	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('zoom') + ' (%):');
	
	row.appendChild(td);
	
	var zoomInput = document.createElement('input');
	zoomInput.setAttribute('type', 'number');
	zoomInput.setAttribute('value', '100');
	zoomInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(zoomInput);
	row.appendChild(td);

	tbody.appendChild(row);

	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('width') + ':');
	
	row.appendChild(td);
	
	var widthInput = document.createElement('input');
	widthInput.setAttribute('value', width);
	widthInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(widthInput);
	row.appendChild(td);

	tbody.appendChild(row);
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('height') + ':');
	
	row.appendChild(td);
	
	var heightInput = document.createElement('input');
	heightInput.setAttribute('value', height);
	heightInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(heightInput);
	row.appendChild(td);

	tbody.appendChild(row);
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('dpi') + ':');
	
	row.appendChild(td);
	
	var dpiSelect = document.createElement('select');
	dpiSelect.style.width = '180px';

	var dpi100Option = document.createElement('option');
	dpi100Option.setAttribute('value', '100');
	mxUtils.write(dpi100Option, '100dpi');
	dpiSelect.appendChild(dpi100Option);

	var dpi200Option = document.createElement('option');
	dpi200Option.setAttribute('value', '200');
	mxUtils.write(dpi200Option, '200dpi');
	dpiSelect.appendChild(dpi200Option);
	
	var dpi300Option = document.createElement('option');
	dpi300Option.setAttribute('value', '300');
	mxUtils.write(dpi300Option, '300dpi');
	dpiSelect.appendChild(dpi300Option);
	
	var dpi400Option = document.createElement('option');
	dpi400Option.setAttribute('value', '400');
	mxUtils.write(dpi400Option, '400dpi');
	dpiSelect.appendChild(dpi400Option);
	
	var dpiCustOption = document.createElement('option');
	dpiCustOption.setAttribute('value', 'custom');
	mxUtils.write(dpiCustOption, mxResources.get('custom'));
	dpiSelect.appendChild(dpiCustOption);

	var customDpi = document.createElement('input');
	customDpi.style.width = '180px';
	customDpi.style.display = 'none';
	customDpi.setAttribute('value', '100');
	customDpi.setAttribute('type', 'number');
	customDpi.setAttribute('min', '50');
	customDpi.setAttribute('step', '50');
	
	var zoomUserChanged = false;
	
	mxEvent.addListener(dpiSelect, 'change', function()
	{
		if (this.value == 'custom')
		{
			this.style.display = 'none';
			customDpi.style.display = '';
			customDpi.focus();
		}
		else
		{
			customDpi.value = this.value;
			
			if (!zoomUserChanged) 
			{
				zoomInput.value = this.value;
			}
		}
	});
	
	mxEvent.addListener(customDpi, 'change', function()
	{
		var dpi = parseInt(customDpi.value);
		
		if (isNaN(dpi) || dpi <= 0)
		{
			customDpi.style.backgroundColor = 'red';
		}
		else
		{
			customDpi.style.backgroundColor = '';

			if (!zoomUserChanged) 
			{
				zoomInput.value = dpi;
			}
		}	
	});
	
	td = document.createElement('td');
	td.appendChild(dpiSelect);
	td.appendChild(customDpi);
	row.appendChild(td);

	tbody.appendChild(row);
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('background') + ':');
	
	row.appendChild(td);
	
	var transparentCheckbox = document.createElement('input');
	transparentCheckbox.setAttribute('type', 'checkbox');
	transparentCheckbox.checked = graph.background == null || graph.background == mxConstants.NONE;

	td = document.createElement('td');
	td.appendChild(transparentCheckbox);
	mxUtils.write(td, mxResources.get('transparent'));
	
	row.appendChild(td);
	
	tbody.appendChild(row);
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('grid') + ':');
	
	row.appendChild(td);
	
	var gridCheckbox = document.createElement('input');
	gridCheckbox.setAttribute('type', 'checkbox');
	gridCheckbox.checked = false;

	td = document.createElement('td');
	td.appendChild(gridCheckbox);
	
	row.appendChild(td);
	
	tbody.appendChild(row);
	
	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('borderWidth') + ':');
	
	row.appendChild(td);
	
	var borderInput = document.createElement('input');
	borderInput.setAttribute('type', 'number');
	borderInput.setAttribute('value', ExportDialog.lastBorderValue);
	borderInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(borderInput);
	row.appendChild(td);

	tbody.appendChild(row);
	table.appendChild(tbody);
	
	// Handles changes in the export format
	function formatChanged()
	{
		var name = nameInput.value;
		var dot = name.lastIndexOf('.');
		
		if (dot > 0)
		{
			nameInput.value = name.substring(0, dot + 1) + imageFormatSelect.value;
		}
		else
		{
			nameInput.value = name + '.' + imageFormatSelect.value;
		}
		
		if (imageFormatSelect.value === 'xml')
		{
			zoomInput.setAttribute('disabled', 'true');
			widthInput.setAttribute('disabled', 'true');
			heightInput.setAttribute('disabled', 'true');
			borderInput.setAttribute('disabled', 'true');
		}
		else
		{
			zoomInput.removeAttribute('disabled');
			widthInput.removeAttribute('disabled');
			heightInput.removeAttribute('disabled');
			borderInput.removeAttribute('disabled');
		}
		
		if (imageFormatSelect.value === 'png' || imageFormatSelect.value === 'svg' || imageFormatSelect.value === 'pdf')
		{
			transparentCheckbox.removeAttribute('disabled');
		}
		else
		{
			transparentCheckbox.setAttribute('disabled', 'disabled');
		}
		
		if (imageFormatSelect.value === 'png' || imageFormatSelect.value === 'jpg' || imageFormatSelect.value === 'pdf')
		{
			gridCheckbox.removeAttribute('disabled');
		}
		else
		{
			gridCheckbox.setAttribute('disabled', 'disabled');
		}
		
		if (imageFormatSelect.value === 'png')
		{
			dpiSelect.removeAttribute('disabled');
			customDpi.removeAttribute('disabled');
		}
		else
		{
			dpiSelect.setAttribute('disabled', 'disabled');
			customDpi.setAttribute('disabled', 'disabled');
		}
	};
	
	mxEvent.addListener(imageFormatSelect, 'change', formatChanged);
	formatChanged();

	function checkValues()
	{
		if (widthInput.value * heightInput.value > MAX_AREA || widthInput.value <= 0)
		{
			widthInput.style.backgroundColor = 'red';
		}
		else
		{
			widthInput.style.backgroundColor = '';
		}
		
		if (widthInput.value * heightInput.value > MAX_AREA || heightInput.value <= 0)
		{
			heightInput.style.backgroundColor = 'red';
		}
		else
		{
			heightInput.style.backgroundColor = '';
		}
	};

	mxEvent.addListener(zoomInput, 'change', function()
	{
		zoomUserChanged = true;
		var s = Math.max(0, parseFloat(zoomInput.value) || 100) / 100;
		zoomInput.value = parseFloat((s * 100).toFixed(2));
		
		if (width > 0)
		{
			widthInput.value = Math.floor(width * s);
			heightInput.value = Math.floor(height * s);
		}
		else
		{
			zoomInput.value = '100';
			widthInput.value = width;
			heightInput.value = height;
		}
		
		checkValues();
	});

	mxEvent.addListener(widthInput, 'change', function()
	{
		var s = parseInt(widthInput.value) / width;
		
		if (s > 0)
		{
			zoomInput.value = parseFloat((s * 100).toFixed(2));
			heightInput.value = Math.floor(height * s);
		}
		else
		{
			zoomInput.value = '100';
			widthInput.value = width;
			heightInput.value = height;
		}
		
		checkValues();
	});

	mxEvent.addListener(heightInput, 'change', function()
	{
		var s = parseInt(heightInput.value) / height;
		
		if (s > 0)
		{
			zoomInput.value = parseFloat((s * 100).toFixed(2));
			widthInput.value = Math.floor(width * s);
		}
		else
		{
			zoomInput.value = '100';
			widthInput.value = width;
			heightInput.value = height;
		}
		
		checkValues();
	});
	
	row = document.createElement('tr');
	td = document.createElement('td');
	td.setAttribute('align', 'right');
	td.style.paddingTop = '22px';
	td.colSpan = 2;
	
	var saveBtn = mxUtils.button(mxResources.get('export'), mxUtils.bind(this, function()
	{
		if (parseInt(zoomInput.value) <= 0)
		{
			mxUtils.alert(mxResources.get('drawingEmpty'));
		}
		else
		{
	    	var name = nameInput.value;
			var format = imageFormatSelect.value;
	    	var s = Math.max(0, parseFloat(zoomInput.value) || 100) / 100;
			var b = Math.max(0, parseInt(borderInput.value));
			var bg = graph.background;
			var dpi = Math.max(1, parseInt(customDpi.value));
			
			if ((format == 'svg' || format == 'png' || format == 'pdf') && transparentCheckbox.checked)
			{
				bg = null;
			}
			else if (bg == null || bg == mxConstants.NONE)
			{
				bg = '#ffffff';
			}
			
			ExportDialog.lastBorderValue = b;
			ExportDialog.exportFile(editorUi, name, format, bg, s, b, dpi, gridCheckbox.checked);
		}
	}));
	saveBtn.className = 'geBtn gePrimaryBtn';
	
	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		td.appendChild(cancelBtn);
		td.appendChild(saveBtn);
	}
	else
	{
		td.appendChild(saveBtn);
		td.appendChild(cancelBtn);
	}

	row.appendChild(td);
	tbody.appendChild(row);
	table.appendChild(tbody);
	this.container = table;
};

/**
 * Remembers last value for border.
 */
ExportDialog.lastBorderValue = 0;

/**
 * Global switches for the export dialog.
 */
ExportDialog.showGifOption = true;

/**
 * Global switches for the export dialog.
 */
ExportDialog.showXmlOption = true;

/**
 * Hook for getting the export format. Returns null for the default
 * intermediate XML export format or a function that returns the
 * parameter and value to be used in the request in the form
 * key=value, where value should be URL encoded.
 */
ExportDialog.exportFile = function(editorUi, name, format, bg, s, b, dpi, grid)
{
	var graph = editorUi.editor.graph;
	
	if (format == 'xml')
	{
    	ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
	}
    else if (format == 'svg')
	{
		ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
	}
    else
    {
    	var bounds = graph.getGraphBounds();
    	
		// New image export
		var xmlDoc = mxUtils.createXmlDocument();
		var root = xmlDoc.createElement('output');
		xmlDoc.appendChild(root);
		
	    // Renders graph. Offset will be multiplied with state's scale when painting state.
		var xmlCanvas = new mxXmlCanvas2D(root);
		xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale),
			Math.floor((b / s - bounds.y) / graph.view.scale));
		xmlCanvas.scale(s / graph.view.scale);
		
		var imgExport = new mxImageExport()
	    imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
	    
		// Puts request data together
		var param = 'xml=' + encodeURIComponent(mxUtils.getXml(root));
		var w = Math.ceil(bounds.width * s / graph.view.scale + 2 * b);
		var h = Math.ceil(bounds.height * s / graph.view.scale + 2 * b);
		
		// Requests image if request is valid
		if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA)
		{
			editorUi.hideDialog();
			var req = new mxXmlRequest(EXPORT_URL, 'format=' + format +
				'&filename=' + encodeURIComponent(name) +
				'&bg=' + ((bg != null) ? bg : 'none') +
				'&w=' + w + '&h=' + h + '&' + param +
				'&dpi=' + dpi);
			req.simulate(document, '_blank');
		}
		else
		{
			mxUtils.alert(mxResources.get('drawingTooLarge'));
		}
	}
};

/**
 * Hook for getting the export format. Returns null for the default
 * intermediate XML export format or a function that returns the
 * parameter and value to be used in the request in the form
 * key=value, where value should be URL encoded.
 */
ExportDialog.saveLocalFile = function(editorUi, data, filename, format)
{
	if (data.length < MAX_REQUEST_SIZE)
	{
		editorUi.hideDialog();
		var req = new mxXmlRequest(SAVE_URL, 'xml=' + encodeURIComponent(data) + '&filename=' +
			encodeURIComponent(filename) + '&format=' + format);
		req.simulate(document, '_blank');
	}
	else
	{
		mxUtils.alert(mxResources.get('drawingTooLarge'));
		mxUtils.popup(xml);
	}
};

/**
 * Constructs a new metadata dialog.
 */
var EditDataDialog = function(ui, cell)
{
	var div = document.createElement('div');
	var graph = ui.editor.graph;
	
	var value = graph.getModel().getValue(cell);
	
	// Converts the value to an XML node
	if (!mxUtils.isNode(value))
	{
		var doc = mxUtils.createXmlDocument();
		var obj = doc.createElement('object');
		obj.setAttribute('label', value || '');
		value = obj;
	}
	
	var meta = {};
	
	try
	{
		var temp = mxUtils.getValue(ui.editor.graph.getCurrentCellStyle(cell), 'metaData', null);
		
		if (temp != null)
		{
			meta = JSON.parse(temp);
		}
	}
	catch (e)
	{
		// ignore
	}
	
	// Creates the dialog contents
	var form = new mxForm('properties');
	form.table.style.width = '100%';

	var attrs = value.attributes;
	var names = [];
	var texts = [];
	var count = 0;

	var id = (EditDataDialog.getDisplayIdForCell != null) ?
		EditDataDialog.getDisplayIdForCell(ui, cell) : null;
	
	var addRemoveButton = function(text, name)
	{
		var wrapper = document.createElement('div');
		wrapper.style.position = 'relative';
		wrapper.style.paddingRight = '20px';
		wrapper.style.boxSizing = 'border-box';
		wrapper.style.width = '100%';
		
		var removeAttr = document.createElement('a');
		var img = mxUtils.createImage(Dialog.prototype.closeImage);
		img.style.height = '9px';
		img.style.fontSize = '9px';
		img.style.marginBottom = (mxClient.IS_IE11) ? '-1px' : '5px';
		
		removeAttr.className = 'geButton';
		removeAttr.setAttribute('title', mxResources.get('delete'));
		removeAttr.style.position = 'absolute';
		removeAttr.style.top = '4px';
		removeAttr.style.right = '0px';
		removeAttr.style.margin = '0px';
		removeAttr.style.width = '9px';
		removeAttr.style.height = '9px';
		removeAttr.style.cursor = 'pointer';
		removeAttr.appendChild(img);
		
		var removeAttrFn = (function(name)
		{
			return function()
			{
				var count = 0;
				
				for (var j = 0; j < names.length; j++)
				{
					if (names[j] == name)
					{
						texts[j] = null;
						form.table.deleteRow(count + ((id != null) ? 1 : 0));
						
						break;
					}
					
					if (texts[j] != null)
					{
						count++;
					}
				}
			};
		})(name);
		
		mxEvent.addListener(removeAttr, 'click', removeAttrFn);
		
		var parent = text.parentNode;
		wrapper.appendChild(text);
		wrapper.appendChild(removeAttr);
		parent.appendChild(wrapper);
	};
	
	var addTextArea = function(index, name, value)
	{
		names[index] = name;
		texts[index] = form.addTextarea(names[count] + ':', value, 2);
		texts[index].style.width = '100%';
		
		if (value.indexOf('\n') > 0)
		{
			texts[index].setAttribute('rows', '2');
		}
		
		addRemoveButton(texts[index], name);
		
		if (meta[name] != null && meta[name].editable == false)
		{
			texts[index].setAttribute('disabled', 'disabled');
		}
	};
	
	var temp = [];
	var isLayer = graph.getModel().getParent(cell) == graph.getModel().getRoot();

	for (var i = 0; i < attrs.length; i++)
	{
		if ((attrs[i].nodeName != 'label' || Graph.translateDiagram ||
			isLayer) && attrs[i].nodeName != 'placeholders')
		{
			temp.push({name: attrs[i].nodeName, value: attrs[i].nodeValue});
		}
	}
	
	// Sorts by name
	temp.sort(function(a, b)
	{
	    if (a.name < b.name)
	    {
	    	return -1;
	    }
	    else if (a.name > b.name)
	    {
	    	return 1;
	    }
	    else
	    {
	    	return 0;
	    }
	});

	if (id != null)
	{	
		var text = document.createElement('div');
		text.style.width = '100%';
		text.style.fontSize = '11px';
		text.style.textAlign = 'center';
		mxUtils.write(text, id);
		
		var idInput = form.addField(mxResources.get('id') + ':', text);
		
		mxEvent.addListener(text, 'dblclick', function(evt)
		{
			var dlg = new FilenameDialog(ui, id, mxResources.get('apply'), mxUtils.bind(this, function(value)
			{
				if (value != null && value.length > 0 && value != id)
				{
					if (graph.model.isRoot(cell))
					{
						var page = ui.getPageById(id);

						if (page != null)
						{
							if (ui.getPageById(value) == null)
							{
								var index = ui.getPageIndex(page);

								if (index >= 0)
								{
									ui.removePage(page);
									page.node.setAttribute('id', value);
									id = value;
									idInput.innerHTML = mxUtils.htmlEntities(value);
									ui.insertPage(page, index);
								}
							}
							else
							{
								ui.handleError({message: mxResources.get('alreadyExst', [mxResources.get('page')])});
							}
						}
					}
					else
					{
						if (graph.getModel().getCell(value) == null)
						{
							graph.getModel().cellRemoved(cell);
							cell.setId(value);
							id = value;
							idInput.innerHTML = mxUtils.htmlEntities(value);
							graph.getModel().cellAdded(cell);
						}
						else
						{
							ui.handleError({message: mxResources.get('alreadyExst', [value])});
						}
					}
				}
			}), mxResources.get('id'), null, null, null, null, null, null, 200);
			ui.showDialog(dlg.container, 300, 80, true, true);
			dlg.init();
		});
	}
	
	for (var i = 0; i < temp.length; i++)
	{
		addTextArea(count, temp[i].name, temp[i].value);
		count++;
	}
	
	var top = document.createElement('div');
	top.style.position = 'absolute';
	top.style.top = '30px';
	top.style.left = '30px';
	top.style.right = '30px';
	top.style.bottom = '80px';
	top.style.overflowY = 'auto';
	
	top.appendChild(form.table);

	var newProp = document.createElement('div');
	newProp.style.display = 'flex';
	newProp.style.alignItems = 'center';
	newProp.style.boxSizing = 'border-box';
	newProp.style.paddingRight = '160px';
	newProp.style.whiteSpace = 'nowrap';
	newProp.style.marginTop = '6px';
	newProp.style.width = '100%';
	
	var nameInput = document.createElement('input');
	nameInput.setAttribute('placeholder', mxResources.get('enterPropertyName'));
	nameInput.setAttribute('type', 'text');
	nameInput.setAttribute('size', (mxClient.IS_IE || mxClient.IS_IE11) ? '36' : '40');
	nameInput.style.boxSizing = 'border-box';
	nameInput.style.borderWidth = '1px';
	nameInput.style.borderStyle = 'solid';
	nameInput.style.marginLeft = '2px';
	nameInput.style.padding = '4px';
	nameInput.style.width = '100%';
	
	newProp.appendChild(nameInput);
	top.appendChild(newProp);
	div.appendChild(top);
	
	var addBtn = mxUtils.button(mxResources.get('addProperty'), function()
	{
		var name = nameInput.value;

		// Avoid ':' in attribute names which seems to be valid in Chrome
		if (name.length > 0 && name != 'label' && name != 'id' &&
			name != 'placeholders' && name.indexOf(':') < 0)
		{
			try
			{
				var idx = mxUtils.indexOf(names, name);
				
				if (idx >= 0 && texts[idx] != null)
				{
					texts[idx].focus();
				}
				else
				{
					// Checks if the name is valid
					var clone = value.cloneNode(false);
					clone.setAttribute(name, '');
					
					if (idx >= 0)
					{
						names.splice(idx, 1);
						texts.splice(idx, 1);
					}

					names.push(name);
					var text = form.addTextarea(name + ':', '', 2);
					text.style.width = '100%';
					texts.push(text);
					addRemoveButton(text, name);

					text.focus();
				}

				addBtn.setAttribute('disabled', 'disabled');
				nameInput.value = '';
			}
			catch (e)
			{
				mxUtils.alert(e);
			}
		}
		else
		{
			mxUtils.alert(mxResources.get('invalidName'));
		}
	});

	mxEvent.addListener(nameInput, 'keypress', function(e)
	{
		if (e.keyCode == 13 )
		{
			addBtn.click();
		}
	});
	
	this.init = function()
	{
		if (texts.length > 0)
		{
			texts[0].focus();
		}
		else
		{
			nameInput.focus();
		}
	};
	
	addBtn.setAttribute('title', mxResources.get('addProperty'));
	addBtn.setAttribute('disabled', 'disabled');
	addBtn.style.textOverflow = 'ellipsis';
	addBtn.style.position = 'absolute';
	addBtn.style.overflow = 'hidden';
	addBtn.style.width = '144px';
	addBtn.style.right = '0px';
	addBtn.className = 'geBtn';
	newProp.appendChild(addBtn);

	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		ui.hideDialog.apply(ui, arguments);
	});
	
	cancelBtn.setAttribute('title', 'Escape');
	cancelBtn.className = 'geBtn';

	var exportBtn = mxUtils.button(mxResources.get('export'), mxUtils.bind(this, function(evt)
	{
		var result = graph.getDataForCells([cell]);

		var dlg = new EmbedDialog(ui, JSON.stringify(result, null, 2), null, null, function()
		{
			console.log(result);
			ui.alert('Written to Console (Dev Tools)');
		}, mxResources.get('export'), null, 'Console', 'data.json');
		ui.showDialog(dlg.container, 450, 240, true, true);
		dlg.init();
	}));
	
	exportBtn.setAttribute('title', mxResources.get('export'));
	exportBtn.className = 'geBtn';
	
	var applyBtn = mxUtils.button(mxResources.get('apply'), function()
	{
		try
		{
			ui.hideDialog.apply(ui, arguments);
			
			// Clones and updates the value
			value = value.cloneNode(true);
			var removeLabel = false;
			
			for (var i = 0; i < names.length; i++)
			{
				if (texts[i] == null)
				{
					value.removeAttribute(names[i]);
				}
				else
				{
					value.setAttribute(names[i], texts[i].value);
					removeLabel = removeLabel || (names[i] == 'placeholder' &&
						value.getAttribute('placeholders') == '1');
				}
			}
			
			// Removes label if placeholder is assigned
			if (removeLabel)
			{
				value.removeAttribute('label');
			}
			
			// Updates the value of the cell (undoable)
			graph.getModel().setValue(cell, value);
		}
		catch (e)
		{
			mxUtils.alert(e);
		}
	});

	applyBtn.setAttribute('title', 'Ctrl+Enter');
	applyBtn.className = 'geBtn gePrimaryBtn';

	mxEvent.addListener(div, 'keypress', function(e)
	{
		if (e.keyCode == 13 && mxEvent.isControlDown(e))
		{
			applyBtn.click();
		}
	});
	
	function updateAddBtn()
	{
		if (nameInput.value.length > 0)
		{
			addBtn.removeAttribute('disabled');
		}
		else
		{
			addBtn.setAttribute('disabled', 'disabled');
		}
	};

	mxEvent.addListener(nameInput, 'keyup', updateAddBtn);
	
	// Catches all changes that don't fire a keyup (such as paste via mouse)
	mxEvent.addListener(nameInput, 'change', updateAddBtn);
	
	var buttons = document.createElement('div');
	buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;'
	
	if (ui.editor.graph.getModel().isVertex(cell) || ui.editor.graph.getModel().isEdge(cell))
	{
		var replace = document.createElement('span');
		replace.style.marginRight = '10px';
		var input = document.createElement('input');
		input.setAttribute('type', 'checkbox');
		input.style.marginRight = '6px';
		
		if (value.getAttribute('placeholders') == '1')
		{
			input.setAttribute('checked', 'checked');
			input.defaultChecked = true;
		}
	
		mxEvent.addListener(input, 'click', function()
		{
			if (value.getAttribute('placeholders') == '1')
			{
				value.removeAttribute('placeholders');
			}
			else
			{
				value.setAttribute('placeholders', '1');
			}
		});
		
		replace.appendChild(input);
		mxUtils.write(replace, mxResources.get('placeholders'));
		
		if (EditDataDialog.placeholderHelpLink != null)
		{
			var link = document.createElement('a');
			link.setAttribute('href', EditDataDialog.placeholderHelpLink);
			link.setAttribute('title', mxResources.get('help'));
			link.setAttribute('target', '_blank');
			link.style.marginLeft = '8px';
			link.style.cursor = 'help';
			
			var icon = document.createElement('img');
			mxUtils.setOpacity(icon, 50);
			icon.style.height = '16px';
			icon.style.width = '16px';
			icon.setAttribute('border', '0');
			icon.setAttribute('valign', 'middle');
			icon.style.marginTop = (mxClient.IS_IE11) ? '0px' : '-4px';
			icon.setAttribute('src', Editor.helpImage);
			link.appendChild(icon);

			if (Editor.enableCssDarkMode)
			{
				icon.className = 'geAdaptiveAsset';
			}
			
			replace.appendChild(link);
		}
		
		buttons.appendChild(replace);
	}
	
	if (ui.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}
	
	buttons.appendChild(exportBtn);
	buttons.appendChild(applyBtn);

	if (!ui.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}

	div.appendChild(buttons);
	this.container = div;
};

/**
 * Optional help link.
 */
EditDataDialog.getDisplayIdForCell = function(ui, cell)
{
	var id = null;
	
	if (ui.editor.graph.getModel().getParent(cell) != null)
	{
		id = cell.getId();
	}
	
	return id;
};

/**
 * Optional help link.
 */
EditDataDialog.placeholderHelpLink = null;

/**
 * Constructs a new link dialog.
 */
var LinkDialog = function(editorUi, initialValue, btnLabel, fn)
{
	var div = document.createElement('div');
	mxUtils.write(div, mxResources.get('editLink') + ':');
	
	var inner = document.createElement('div');
	inner.className = 'geTitle';
	inner.style.backgroundColor = 'transparent';
	inner.style.borderColor = 'transparent';
	inner.style.whiteSpace = 'nowrap';
	inner.style.textOverflow = 'clip';
	inner.style.cursor = 'default';
	inner.style.paddingRight = '20px';
	
	var linkInput = document.createElement('input');
	linkInput.setAttribute('value', initialValue);
	linkInput.setAttribute('placeholder', 'http://www.example.com/');
	linkInput.setAttribute('type', 'text');
	linkInput.style.marginTop = '6px';
	linkInput.style.width = '400px';
	linkInput.style.backgroundImage = 'url(\'' + Dialog.prototype.clearImage + '\')';
	linkInput.style.backgroundRepeat = 'no-repeat';
	linkInput.style.backgroundPosition = '100% 50%';
	linkInput.style.paddingRight = '14px';
	
	var cross = document.createElement('div');
	cross.setAttribute('title', mxResources.get('reset'));
	cross.style.position = 'relative';
	cross.style.left = '-16px';
	cross.style.width = '12px';
	cross.style.height = '14px';
	cross.style.cursor = 'pointer';

	// Workaround for inline-block not supported in IE
	cross.style.display = 'inline-block';
	cross.style.top = '3px';
	
	// Needed to block event transparency in IE
	cross.style.background = 'url(' + IMAGE_PATH + '/transparent.gif)';

	mxEvent.addListener(cross, 'click', function()
	{
		linkInput.value = '';
		linkInput.focus();
	});
	
	inner.appendChild(linkInput);
	inner.appendChild(cross);
	div.appendChild(inner);
	
	this.init = function()
	{
		linkInput.focus();
		
		if (mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= 5)
		{
			linkInput.select();
		}
		else
		{
			document.execCommand('selectAll', false, null);
		}
	};
	
	var btns = document.createElement('div');
	btns.style.marginTop = '18px';
	btns.style.textAlign = 'right';

	mxEvent.addListener(linkInput, 'keypress', function(e)
	{
		if (e.keyCode == 13)
		{
			editorUi.hideDialog();
			fn(linkInput.value);
		}
	});

	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		btns.appendChild(cancelBtn);
	}
	
	var mainBtn = mxUtils.button(btnLabel, function()
	{
		editorUi.hideDialog();
		fn(linkInput.value);
	});
	mainBtn.className = 'geBtn gePrimaryBtn';
	btns.appendChild(mainBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		btns.appendChild(cancelBtn);
	}

	div.appendChild(btns);

	this.container = div;
};

/**
 * 
 */
var OutlineWindow = function(editorUi, x, y, w, h)
{
	var graph = editorUi.editor.graph;

	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.width = '100%';
	div.style.height = '100%';
	div.style.overflow = 'hidden';

	this.window = new mxWindow(mxResources.get('outline'), div, x, y, w, h, true, true);
	this.window.minimumSize = new mxRectangle(0, 0, 80, 80);
	this.window.destroyOnClose = false;
	this.window.setMaximizable(false);
	this.window.setResizable(true);
	this.window.setClosable(true);
	this.window.setVisible(true);
	
	var outline = editorUi.createOutline(this.window);

	editorUi.installResizeHandler(this, true, function()
	{
		outline.destroy();
	});

	this.window.addListener(mxEvent.SHOW, mxUtils.bind(this, function()
	{
		this.window.fit();
		outline.setSuspended(false);
	}));
	
	this.window.addListener(mxEvent.HIDE, mxUtils.bind(this, function()
	{
		outline.setSuspended(true);
	}));
	
	this.window.addListener(mxEvent.NORMALIZE, mxUtils.bind(this, function()
	{
		outline.setSuspended(false);
	}));
			
	this.window.addListener(mxEvent.MINIMIZE, mxUtils.bind(this, function()
	{
		outline.setSuspended(true);
	}));

	outline.init(div);
	
	mxEvent.addMouseWheelListener(function(evt, up)
	{
		var outlineWheel = false;
		var source = mxEvent.getSource(evt);

		while (source != null)
		{
			if (source == outline.svg)
			{
				outlineWheel = true;
				break;
			}

			source = source.parentNode;
		}

		if (outlineWheel)
		{
			var factor = graph.zoomFactor;

			// Slower zoom for pinch gesture on trackpad
			if (evt.deltaY != null && Math.round(evt.deltaY) != evt.deltaY)
			{
				factor = 1 + (Math.abs(evt.deltaY) / 20) * (factor - 1);
			}

			graph.lazyZoom(up, null, null, factor);
			mxEvent.consume(evt);
		}
	});
};

/**
 * 
 */
var LayersWindow = function(editorUi, x, y, w, h)
{
	var graph = editorUi.editor.graph;
	
	var div = document.createElement('div');
	div.className = 'geBackground';
	div.style.userSelect = 'none';
	div.style.border = '1px solid whiteSmoke';
	div.style.height = '100%';
	div.style.marginBottom = '10px';
	div.style.overflow = 'auto';

	var tbarHeight = (!EditorUi.compactUi) ? '30px' : '26px';
	
	var listDiv = document.createElement('div')
	listDiv.className = 'geBackground';
	listDiv.style.position = 'absolute';
	listDiv.style.overflow = 'auto';
	listDiv.style.left = '0px';
	listDiv.style.right = '0px';
	listDiv.style.top = '0px';
	listDiv.style.bottom = (parseInt(tbarHeight) + 7) + 'px';
	div.appendChild(listDiv);
	
	var dragSource = null;
	var dropIndex = null;
	
	mxEvent.addListener(div, 'dragover', function(evt)
	{
		evt.dataTransfer.dropEffect = 'move';
		dropIndex = 0;
		evt.stopPropagation();
		evt.preventDefault();
	});
	
	// Workaround for "no element found" error in FF
	mxEvent.addListener(div, 'drop', function(evt)
	{
		evt.stopPropagation();
		evt.preventDefault();
	});

	var layerCount = null;
	var selectionLayer = null;
	var ldiv = document.createElement('div');
	
	ldiv.className = 'geToolbarContainer';
	ldiv.style.position = 'absolute';
	ldiv.style.bottom = '0px';
	ldiv.style.left = '0px';
	ldiv.style.right = '0px';
	ldiv.style.height = tbarHeight;
	ldiv.style.overflow = 'hidden';
	ldiv.style.padding = (!EditorUi.compactUi) ? '1px' : '4px 0px 3px 0px';
	ldiv.style.borderWidth = '1px 0px 0px 0px';
	ldiv.style.borderStyle = 'solid';
	ldiv.style.display = 'block';
	ldiv.style.whiteSpace = 'nowrap';
	
	var link = document.createElement('a');
	link.className = 'geButton';
	
	var removeLink = link.cloneNode(false);
	var img = document.createElement('img');
	img.className = 'geAdaptiveAsset';
	img.setAttribute('border', '0');
	img.setAttribute('width', '22');
	img.setAttribute('src', Editor.trashImage);
	img.style.opacity = '0.9';

	removeLink.appendChild(img);

	mxEvent.addListener(removeLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			graph.model.beginUpdate();
			try
			{
				var index = graph.model.root.getIndex(selectionLayer);
				graph.removeCells([selectionLayer], false);
				
				// Creates default layer if no layer exists
				if (graph.model.getChildCount(graph.model.root) == 0)
				{
					graph.model.add(graph.model.root, new mxCell());
					graph.setDefaultParent(null);
				}
				else if (index > 0 && index <= graph.model.getChildCount(graph.model.root))
				{
					graph.setDefaultParent(graph.model.getChildAt(graph.model.root, index - 1));
				}
				else
				{
					graph.setDefaultParent(null);
				}
			}
			finally
			{
				graph.model.endUpdate();
			}
		}
		
		mxEvent.consume(evt);
	});
	
	if (!graph.isEnabled())
	{
		removeLink.className = 'geButton mxDisabled';
	}
	
	ldiv.appendChild(removeLink);

	var insertLink = link.cloneNode();
	insertLink.setAttribute('title', mxUtils.trim(mxResources.get('moveSelectionTo', ['...'])));

	img = img.cloneNode(false);
	img.setAttribute('src', Editor.verticalDotsImage);
	insertLink.appendChild(img);

	mxEvent.addListener(insertLink, 'click', function(evt)
	{
		if (graph.isEnabled() && !graph.isSelectionEmpty())
		{
			var offset = mxUtils.getOffset(insertLink);
			
			editorUi.showPopupMenu(mxUtils.bind(this, function(menu, parent)
			{
				for (var i = layerCount - 1; i >= 0; i--)
				{
					(mxUtils.bind(this, function(child)
					{
						var item = menu.addItem(graph.convertValueToString(child) ||
								mxResources.get('background'), null, mxUtils.bind(this, function()
						{
							graph.moveCells(graph.getSelectionCells(), 0, 0, false, child);
						}), parent);
						
						if (graph.getSelectionCount() == 1 && graph.model.isAncestor(child, graph.getSelectionCell()))
						{
							menu.addCheckmark(item, Editor.checkmarkImage);
						}
						
					}))(graph.model.getChildAt(graph.model.root, i));
				}
			}), offset.x, offset.y + insertLink.offsetHeight, evt);
		}
	});

	ldiv.appendChild(insertLink);
	
	var dataLink = link.cloneNode(false);
	dataLink.setAttribute('title', mxResources.get('editData'));

	img = img.cloneNode(false);
	img.setAttribute('src', Editor.editImage);
	dataLink.appendChild(img);

	mxEvent.addListener(dataLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			editorUi.showDataDialog(selectionLayer);
		}
		
		mxEvent.consume(evt);
	});
	
	if (!graph.isEnabled())
	{
		dataLink.className = 'geButton mxDisabled';
	}

	ldiv.appendChild(dataLink);
	
	function renameLayer(layer)
	{
		if (graph.isEnabled() && layer != null)
		{
			var label = graph.convertValueToString(layer);
			var dlg = new FilenameDialog(editorUi, label || mxResources.get('background'),
				mxResources.get('rename'), mxUtils.bind(this, function(newValue)
			{
				if (newValue != null)
				{
					graph.cellLabelChanged(layer, newValue);
				}
			}), mxResources.get('enterName'));
			editorUi.showDialog(dlg.container, 300, 100, true, true);
			dlg.init();
		}
	};
	
	var duplicateLink = link.cloneNode(false);
	duplicateLink.setAttribute('title', mxResources.get('duplicate'));

	img = img.cloneNode(false);
	img.setAttribute('src', Editor.duplicateImage);
	duplicateLink.appendChild(img);

	mxEvent.addListener(duplicateLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			var newCell = null;
			graph.model.beginUpdate();
			try
			{
				newCell = graph.cloneCell(selectionLayer);
				graph.cellLabelChanged(newCell, mxResources.get('untitledLayer'));
				newCell.setVisible(true);
				newCell = graph.addCell(newCell, graph.model.root);
				graph.setDefaultParent(newCell);
			}
			finally
			{
				graph.model.endUpdate();
			}

			if (newCell != null && !graph.isCellLocked(newCell))
			{
				graph.selectAll(newCell);
			}
		}
	});
	
	if (!graph.isEnabled())
	{
		duplicateLink.className = 'geButton mxDisabled';
	}

	ldiv.appendChild(duplicateLink);

	var addLink = link.cloneNode(false);
	addLink.setAttribute('title', mxResources.get('addLayer'));

	img = img.cloneNode(false);
	img.setAttribute('src', Editor.addImage);
	addLink.appendChild(img);
	
	mxEvent.addListener(addLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			graph.model.beginUpdate();
			
			try
			{
				var cell = graph.addCell(new mxCell(mxResources.get('untitledLayer')), graph.model.root);
				graph.setDefaultParent(cell);
			}
			finally
			{
				graph.model.endUpdate();
			}
		}
		
		mxEvent.consume(evt);
	});
	
	if (!graph.isEnabled())
	{
		addLink.className = 'geButton mxDisabled';
	}
	
	ldiv.appendChild(addLink);
	div.appendChild(ldiv);
	
	var layerDivs = new mxDictionary();
	
	var dot = document.createElement('span');
	dot.setAttribute('title', mxResources.get('selectionOnly'));
	dot.innerHTML = '&#8226;';
	dot.style.position = 'absolute';
	dot.style.fontWeight = 'bold';
	dot.style.fontSize = '16pt';
	dot.style.right = '2px';
	dot.style.top = '2px';
	
	function updateLayerDot()
	{
		var div = layerDivs.get(graph.getLayerForCells(graph.getSelectionCells()));
		
		if (div != null)
		{
			div.appendChild(dot);
		}
		else if (dot.parentNode != null)
		{
			dot.parentNode.removeChild(dot);
		}
	};
	
	function refresh()
	{
		layerCount = graph.model.getChildCount(graph.model.root)
		listDiv.innerText = '';
		layerDivs.clear();
		
		function addLayer(index, label, child, defaultParent)
		{
			var ldiv = document.createElement('div');
			ldiv.className = 'geToolbarContainer';
			layerDivs.put(child, ldiv);

			ldiv.style.overflow = 'hidden';
			ldiv.style.position = 'relative';
			ldiv.style.padding = '4px';
			ldiv.style.height = '22px';
			ldiv.style.display = 'block';
			ldiv.style.backgroundColor = (Editor.isDarkMode()) ?
				Editor.darkColor : 'whiteSmoke';
			ldiv.style.borderWidth = '0px 0px 1px 0px';
			ldiv.style.borderColor = '#c3c3c3';
			ldiv.style.borderStyle = 'solid';
			ldiv.style.whiteSpace = 'nowrap';
			ldiv.setAttribute('title', label);
			
			var left = document.createElement('div');
			left.style.display = 'inline-block';
			left.style.width = '100%';
			left.style.textOverflow = 'ellipsis';
			left.style.overflow = 'hidden';
			
			mxEvent.addListener(ldiv, 'dragover', function(evt)
			{
				evt.dataTransfer.dropEffect = 'move';
				dropIndex = index;
				evt.stopPropagation();
				evt.preventDefault();
			});
			
			mxEvent.addListener(ldiv, 'dragstart', function(evt)
			{
				dragSource = ldiv;
				
				// Workaround for no DnD on DIV in FF
				if (mxClient.IS_FF)
				{
					// LATER: Check what triggers a parse as XML on this in FF after drop
					evt.dataTransfer.setData('Text', '<layer/>');
				}
			});
			
			mxEvent.addListener(ldiv, 'dragend', function(evt)
			{
				if (dragSource != null && dropIndex != null)
				{
					graph.addCell(child, graph.model.root, dropIndex);
				}

				dragSource = null;
				dropIndex = null;
				evt.stopPropagation();
				evt.preventDefault();
			});

			var inp = document.createElement('img');
			inp.setAttribute('draggable', 'false');
			inp.setAttribute('align', 'top');
			inp.setAttribute('border', '0');
			inp.className = 'geAdaptiveAsset';
			inp.style.width = '16px';
			inp.style.padding = '0px 6px 0 4px';
			inp.style.marginTop = '2px';
			inp.style.cursor = 'pointer';
			inp.setAttribute('title', mxResources.get(
				graph.model.isVisible(child) ?
				'hide' : 'show'));

			if (graph.model.isVisible(child))
			{
				inp.setAttribute('src', Editor.visibleImage);
				mxUtils.setOpacity(ldiv, 90);
			}
			else
			{
				inp.setAttribute('src', Editor.hiddenImage);
				mxUtils.setOpacity(ldiv, 40);
			}

			left.appendChild(inp);
			
			mxEvent.addListener(inp, 'click', function(evt)
			{
				graph.model.setVisible(child, !graph.model.isVisible(child));
				mxEvent.consume(evt);
			});

			var btn = document.createElement('img');
			btn.setAttribute('draggable', 'false');
			btn.setAttribute('align', 'top');
			btn.setAttribute('border', '0');
			btn.className = 'geAdaptiveAsset';
			btn.style.width = '16px';
			btn.style.padding = '0px 6px 0 0';
			btn.style.marginTop = '2px';
			btn.setAttribute('title', mxResources.get('lockUnlock'));

			var style = graph.getCurrentCellStyle(child);

			if (mxUtils.getValue(style, 'locked', '0') == '1')
			{
				btn.setAttribute('src', Editor.lockedImage);
				mxUtils.setOpacity(btn, 90);
				ldiv.style.color = 'red';
			}
			else
			{
				btn.setAttribute('src', Editor.unlockedImage);
				mxUtils.setOpacity(btn, 40);
			}
			
			if (graph.isEnabled())
			{
				btn.style.cursor = 'pointer';
			}
			
			mxEvent.addListener(btn, 'click', function(evt)
			{
				if (graph.isEnabled())
				{
					var value = null;
					
					graph.getModel().beginUpdate();
					try
					{
			    		value = (mxUtils.getValue(style, 'locked', '0') == '1') ? null : '1';
			    		graph.setCellStyles('locked', value, [child]);
					}
					finally
					{
						graph.getModel().endUpdate();
					}

					if (value == '1')
					{
						graph.removeSelectionCells(graph.getModel().getDescendants(child));
					}
					
					mxEvent.consume(evt);
				}
			});

			left.appendChild(btn);

			var span = document.createElement('span');
			mxUtils.write(span, label);
			span.style.display = 'block';
			span.style.whiteSpace = 'nowrap';
			span.style.overflow = 'hidden';
			span.style.textOverflow = 'ellipsis';
			span.style.position = 'absolute';
			span.style.left = '52px';
			span.style.right = '8px';
			span.style.top = '8px';

			left.appendChild(span);
			ldiv.appendChild(left);
			
			if (graph.isEnabled())
			{
				// Fallback if no drag and drop is available
				if (mxClient.IS_TOUCH || mxClient.IS_POINTER ||
					(mxClient.IS_IE && document.documentMode < 10))
				{
					var right = document.createElement('div');
					right.style.display = 'block';
					right.style.textAlign = 'right';
					right.style.whiteSpace = 'nowrap';
					right.style.position = 'absolute';
					right.style.right = '16px';
					right.style.top = '6px';
		
					// Poor man's change layer order
					if (index > 0)
					{
						var img2 = document.createElement('a');
						
						img2.setAttribute('title', mxResources.get('toBack'));
						
						img2.className = 'geButton';
						img2.style.cssFloat = 'none';
						img2.innerHTML = '&#9660;';
						img2.style.width = '14px';
						img2.style.height = '14px';
						img2.style.fontSize = '14px';
						img2.style.margin = '0px';
						img2.style.marginTop = '-1px';
						right.appendChild(img2);
						
						mxEvent.addListener(img2, 'click', function(evt)
						{
							if (graph.isEnabled())
							{
								graph.addCell(child, graph.model.root, index - 1);
							}
							
							mxEvent.consume(evt);
						});
					}
		
					if (index >= 0 && index < layerCount - 1)
					{
						var img1 = document.createElement('a');
						
						img1.setAttribute('title', mxResources.get('toFront'));
						
						img1.className = 'geButton';
						img1.style.cssFloat = 'none';
						img1.innerHTML = '&#9650;';
						img1.style.width = '14px';
						img1.style.height = '14px';
						img1.style.fontSize = '14px';
						img1.style.margin = '0px';
						img1.style.marginTop = '-1px';
						right.appendChild(img1);
						
						mxEvent.addListener(img1, 'click', function(evt)
						{
							if (graph.isEnabled())
							{
								graph.addCell(child, graph.model.root, index + 1);
							}
							
							mxEvent.consume(evt);
						});
					}
					
					ldiv.appendChild(right);
				}
				
				if (mxClient.IS_SVG && (!mxClient.IS_IE || document.documentMode >= 10))
				{
					ldiv.setAttribute('draggable', 'true');
					ldiv.style.cursor = 'move';
				}
			}

			mxEvent.addListener(ldiv, 'dblclick', function(evt)
			{
				var nodeName = mxEvent.getSource(evt).nodeName;
				
				if (nodeName != 'INPUT' && nodeName != 'IMG')
				{
					renameLayer(child);
					mxEvent.consume(evt);
				}
			});

			if (graph.getDefaultParent() == child)
			{
				ldiv.style.background = (!Editor.isDarkMode()) ? '#e6eff8' : '#505759';
				ldiv.style.fontWeight = (graph.isEnabled()) ? 'bold' : '';
				selectionLayer = child;
			}

			mxEvent.addListener(ldiv, 'click', function(evt)
			{
				if (graph.isEnabled())
				{
					graph.setDefaultParent(defaultParent);
					graph.view.setCurrentRoot(null);

					if (mxEvent.isShiftDown(evt))
					{
						graph.setSelectionCells(child.children);	
					}
					
					mxEvent.consume(evt);
				}
			});
			
			listDiv.appendChild(ldiv);
		};
		
		// Cannot be moved or deleted
		for (var i = layerCount - 1; i >= 0; i--)
		{
			(mxUtils.bind(this, function(child)
			{
				addLayer(i, graph.convertValueToString(child) ||
					mxResources.get('background'), child, child);
			}))(graph.model.getChildAt(graph.model.root, i));
		}
		
		var label = graph.convertValueToString(selectionLayer) || mxResources.get('background');
		removeLink.setAttribute('title', mxResources.get('removeIt', [label]));
		duplicateLink.setAttribute('title', mxResources.get('duplicateIt', [label]));

		if (graph.isSelectionEmpty())
		{
			insertLink.className = 'geButton mxDisabled';
		}
		
		updateLayerDot();
	};

	refresh();
	graph.model.addListener(mxEvent.CHANGE, refresh);
	graph.addListener('defaultParentChanged', refresh);
	
	graph.selectionModel.addListener(mxEvent.CHANGE, function()
	{
		if (graph.isSelectionEmpty())
		{
			insertLink.className = 'geButton mxDisabled';
		}
		else
		{
			insertLink.className = 'geButton';
		}
		
		updateLayerDot();
	});

	this.window = new mxWindow(mxResources.get('layers'), div, x, y, w, h, true, true);
	this.window.minimumSize = new mxRectangle(0, 0, 150, 120);
	this.window.destroyOnClose = false;
	this.window.setMaximizable(false);
	this.window.setResizable(true);
	this.window.setClosable(true);
	this.window.setVisible(true);
	
	this.init = function()
	{
		listDiv.scrollTop = listDiv.scrollHeight - listDiv.clientHeight;	
	};

	this.window.addListener(mxEvent.SHOW, mxUtils.bind(this, function()
	{
		this.window.fit();
	}));
	
	// Make refresh available via instance
	this.refreshLayers = refresh;
	editorUi.installResizeHandler(this, true);
};

var global_step =0;
var AnimationWindow = function(editorUi, x, y, w, h)
	{
               
		var table = document.createElement('table');
		table.style.width = '100%';
		table.style.height = '100%';
		var tbody = document.createElement('tbody');
		var tr1 = document.createElement('tr');
                //tr1.setAttribute('min-height','20px');
		var td11 = document.createElement('td');
		td11.style.width = '140px';
		var td12 = document.createElement('td');
		var tr2 = document.createElement('tr');
		tr2.style.height = '40px';
                
		var td21 = document.createElement('td');
		td21.setAttribute('colspan', '2');
		
                var tr3 = document.createElement('tr');
		tr3.style.height = '40px';
		var td31 = document.createElement('td');
		td31.setAttribute('colspan', '2');
                        
		var list = document.createElement('textarea');
		list.style.overflow = 'auto';
		list.style.width = '100%';
		list.style.height = '100%';
		//td11.appendChild(list);
		
		var root = editorUi.editor.graph.getModel().getRoot();
                console.log("Root:" ,root);
		var stepContInnerHtml ="";
		if (root.value != null && typeof(root.value) == 'object')
		{
			stepContInnerHtml=root.value.getAttribute('steps');
			list.value = root.value.getAttribute('animation');
		}
		// code for ui changes starts
		var parentcontainer = document.createElement('div');
		parentcontainer.style.border = '1px solid lightGray';
		parentcontainer.style.background = '#ffffff';
		parentcontainer.style.width = '100%';
		parentcontainer.style.height = '100%';
		parentcontainer.style.overflow = 'auto';
		
		var stepscontainer = document.createElement('div');
		stepscontainer.id= "stepscontainerdiv";
		stepscontainer.style.border = '1px solid lightGray';
		stepscontainer.style.background = '#ffffff';
		stepscontainer.style.width = '140px';
		stepscontainer.style.height = '360px';
		stepscontainer.style.overflow = 'auto';
                //stepscontainer.style.position = 'fixed';
		
		var container = document.createElement('div');
		container.style.border = '1px solid lightGray';
		container.style.background = '#ffffff';
		container.style.width = '100%';
		container.style.height = '100%';
		container.style.overflow = 'auto';
		
		container.innerHTML = '<br><br><br>';
		
		var animTypeLabel = document.createElement('label');
		animTypeLabel.innerHTML = 'Animation Type ';
		
		var tempSTring= "";
		var animationType = document.createElement("select");
		animationType.type = "text";
		animationType.id = "animationType";
		animationType.size = 1;
		animationType.style.overflow = 'auto';
		/*animationType.style.width = '100%';
		animationType.style.height = '100%';*/
		animationType.options[0] = new Option('Show');
		animationType.options[1] = new Option('Fade In');
		animationType.options[2] = new Option('Wipe In');
		animationType.options[3] = new Option('Fade Out');
		animationType.onfocusout = function(){
			console.log("animationType focusout");
			tempSTring +=  animationType.value + ',';
		};
		
		var opacityLabel = document.createElement('label');
		opacityLabel.innerHTML = 'Opacity ';	
		
		var opacityMaxValue = document.createElement('label');
		opacityMaxValue.id="opacityValue";
		opacityMaxValue.innerHTML = 100;
		
		var opacityMinValue = document.createElement('label');
		opacityMinValue.id="opacityMinValue";
		opacityMinValue.innerHTML = 0;
		
		var opacityValueLabel = document.createElement('label');
		opacityValueLabel.id="opacityValueLab";
		opacityValueLabel.innerHTML = "Opacity Value "
		
		var opacityValue = document.createElement('label');
		opacityValue.id="opacityValue";
		
			
		var opacity = document.createElement("input");
		opacity.type = "range";
		opacity.id = "opacity";
		opacity.setAttribute('min',0);
		opacity.setAttribute('max',100);
		opacity.setAttribute('value',100);
		opacity.oninput = function() {
			console.log("event hit");
			opacityValue.innerHTML = opacity.value;
			};
		opacity.onfocusout = function(){
			console.log("opacity focusout");
			tempSTring +=  opacity.value + ',';
		};

		opacityValue.innerHTML = opacity.value;
		
		var opacityForOthersLabel = document.createElement('label');
		opacityForOthersLabel.innerHTML = 'Opacity For Previous Steps  ';	
		
		var opacityForOthersMaxValue = document.createElement('label');
		opacityForOthersMaxValue.id="opacityForOthersMaxValue";
		opacityForOthersMaxValue.innerHTML = 100;
		
		var opacityForOthersMinValue = document.createElement('label');
		opacityForOthersMinValue.id="opacityMinValue";
		opacityForOthersMinValue.innerHTML = 0;
		
		var opacityForOthersValueLabel = document.createElement('label');
		opacityForOthersValueLabel.id="opacityForOthersValueLabel";
		opacityForOthersValueLabel.innerHTML = "Opacity Value "
		
		var opacityForOthersValue = document.createElement('label');
		opacityForOthersValue.id="opacityForOthersValue";
		
		
		var opacityForOthers = document.createElement("input");
		opacityForOthers.type = "range";
		opacityForOthers.id = "opacityForOthers";
		opacityForOthers.setAttribute('min',0);
		opacityForOthers.setAttribute('max',100);
		opacityForOthers.setAttribute('value',100);
		opacityForOthers.oninput = function() {
			
			opacityForOthersValue.innerHTML = opacityForOthers.value;
			};
		opacityForOthers.onfocusout = function(){
			console.log("opacityForOthers focusout");
			tempSTring +=  opacityForOthers.value + ',';
		};

		opacityForOthersValue.innerHTML = opacityForOthers.value;

		var cellIdLabel = document.createElement('label');
		cellIdLabel.innerHTML = 'Selected Cells  ';	
		//cellIdLabel.style.visibility = "hidden";
		
		var cellId = document.createElement("textarea");
		//cellId.type = "textarea";
		cellId.id = "cellId";
		//cellId.style.visibility = "hidden";
		cellId.style.height = '150px';
		//cellId.style.overflow = 'auto';
                
                var container = document.createElement('div');
                container.id = "container";
                //container.style.border = '1px solid lightGray';
                //container.style.background = '#ffffff';
                //container.style.width = '500px';
                //container.style.height = '500px';
               // container.style.overflow = 'auto';
		//var graph = new Graph(container);
		//graph.setEnabled(false);
		
                
		var table3 = document.createElement('table');
		var table3tbody = document.createElement('tbody');
		
		var table3tr1 = document.createElement('tr');
		table3tr1.style.height = '40px';
		var table3td11 = document.createElement('td');
		var table3td12 = document.createElement('td');
		
		var table3tr2 = document.createElement('tr');
		table3tr2.style.height = '40px';
		var table3td21 = document.createElement('td');
		var table3td22 = document.createElement('td');
		var table3td23 = document.createElement('td');
		var table3td24 = document.createElement('td');
		
		var table3tr3 = document.createElement('tr');
		table3tr3.style.height = '40px';
		var table3td31 = document.createElement('td');
		var table3td32 = document.createElement('td');
		var table3td33 = document.createElement('td');
		var table3td34 = document.createElement('td');
		
		var table3tr4 = document.createElement('tr');
		table3tr4.style.height = '80px';
		var table3td41 = document.createElement('td');
		var table3td42 = document.createElement('td');
		var table3td43 = document.createElement('td');
                
		var table3tr5 = document.createElement('tr');
		table3tr5.style.height = '40px';
		var table3td51 = document.createElement('td');
		
		var table3tr6 = document.createElement('tr');
		var table3td61 = document.createElement('td');

		table3td11.appendChild(animTypeLabel);
		table3td12.appendChild(animationType);
		
		table3td21.appendChild(opacityLabel);
		table3td22.appendChild(opacityMinValue);
		table3td22.appendChild(opacity);
		table3td22.appendChild(opacityMaxValue);
		table3td23.appendChild(opacityValueLabel);
		table3td24.appendChild(opacityValue);
		
		
		table3td31.appendChild(opacityForOthersLabel);
		table3td32.appendChild(opacityForOthersMinValue);
		table3td32.appendChild(opacityForOthers);
		table3td32.appendChild(opacityForOthersMaxValue);
		table3td33.appendChild(opacityForOthersValueLabel);
		table3td34.appendChild(opacityForOthersValue);
		
		table3td41.appendChild(cellIdLabel);
		//table3td42.appendChild(cellId);
                table3td42.appendChild(container);
		
		table3tr1.appendChild(table3td11);
		table3tr1.appendChild(table3td12);
		
		table3tr2.appendChild(table3td21);
		table3tr2.appendChild(table3td22);
		table3tr2.appendChild(table3td23);
		table3tr2.appendChild(table3td24);
		
		table3tr3.appendChild(table3td31);
		table3tr3.appendChild(table3td32);
		table3tr3.appendChild(table3td33);
		table3tr3.appendChild(table3td34);
		
		table3tr4.appendChild(table3td41);
		table3tr4.appendChild(table3td42);
                table3tr4.appendChild(table3td43);
		//container.appendChild(table3);
		
		//container.appendChild(cellIdLabel);
		//container.appendChild(cellId);
		//container.innerHTML += '<br><br><br>';

		var stepsOption = document.createElement('select');
		stepsOption.id ="stepsSelect";
		stepsOption.size = 30;
		//stepsOption.style.overflow = 'auto';
		stepsOption.style.width = '100%';
		stepsOption.style.height = '100%';
		stepsOption.onchange = function(event)
		{
			console.log(tempSTring);
			tempSTring="";
			/*var AnimationType = document.getElementById("animationType");
			var Opacity = document.getElementById("opacity");
			var CellId = document.getElementById("cellId");
			var OpacityForOthers = document.getElementById("opacityForOthers");*/
			
			if( stepsOption.options[stepsOption.selectedIndex].value != 'Slideshow Step')
			{
					console.log(stepsOption.options[stepsOption.selectedIndex].value);
                                        document.getElementById('container').innerHTML = '';
                                        var n = stepsOption.options[stepsOption.selectedIndex].value.indexOf("animationtype-");
                                        var n1 = stepsOption.options[stepsOption.selectedIndex].value.indexOf("opacity-");
                                        var n2 = stepsOption.options[stepsOption.selectedIndex].value.indexOf("celldet-");
                                        var n3 = stepsOption.options[stepsOption.selectedIndex].value.indexOf("opacityothers-");
                                        var n4 = stepsOption.options[stepsOption.selectedIndex].value.indexOf("img-");
                                        n1Len = ("animationtype-").length;
                                        n2Len = ("opacity-").length;
                                        n3Len = ("celldet-").length;
                                        n4Len = ("opacityothers-").length;
                                        n5Len = ("img-").length;
                                        //var stepDetails=[];
                                        animType= stepsOption.options[stepsOption.selectedIndex].value.substring(n+n1Len,n1);
                                        //stepDetails.push(animType);
                                        opacityVal = stepsOption.options[stepsOption.selectedIndex].value.substring(n1+n2Len,n2);
                                        //stepDetails.push(opacityVal);
                                        cellDet = stepsOption.options[stepsOption.selectedIndex].value.substring(n2+n3Len,n3);
                                        //stepDetails.push(cellDet);
                                        opacityRestVal = stepsOption.options[stepsOption.selectedIndex].value.substring(n3+n4Len,n4);
                                        //stepDetails.push(opacityRestVal);
                                        //console.log("StepDetails array: ",stepDetails);
                                        imgData = stepsOption.options[stepsOption.selectedIndex].value.substring(n4+n5Len);
					//var details = stepsOption.options[stepsOption.selectedIndex].value.split(',');
					animationType.value = animType;//details[0];
					opacity.value = opacityVal;//details[1];
					opacityValue.innerHTML = opacity.value;
					cellId.value = cellDet;//details[2];
					opacityForOthers.value = opacityRestVal;//details[3];
					opacityForOthersValue.innerHTML = opacityForOthers.value;
                                        
                                        var preview = document.createElement('img');
                                                    preview.setAttribute('src', 'data:' + 'image/png' +  ';base64,' + imgData);
                                                    preview.style.maxWidth = '200px';
                                                    preview.style.maxHeight = '100px';
                                                    mxUtils.setPrefixedStyle(preview.style, 'transform');
                                                    container.appendChild(preview);
					/*
					 var grpSteps =[];
                     if((details[2]!=null || details[2]!='undefined') && details[2].length >=2)
                     {
                     	grpSteps = details[2].split('\n');
                     	
                     }
             		  	
             		 var cellsSelected=[];
                     for(x=0; x<= grpSteps.length-1; x++)
                     {
                     	console.log("Individual Step " + grpSteps[x]);
                         var tokens = grpSteps[x].split(' ');
                        
                         if (tokens.length > 1)
                         {
                         	cellsSelected.push(tokens[3]);
                         }
                     }
					
					editorUi.editor.graph.setSelectionCells(cellsSelected);*/
					
			}
			else if (  stepsOption.options[stepsOption.selectedIndex].value == 'Slideshow Step' )
			{
				animationType.options.selectedIndex = 0;
				opacity.value = 100;
				cellId.value = "";
				opacityForOthers.value = 100;
                                document.getElementById('container').innerHTML = '';
			}
			
			
			
		}
		if(stepContInnerHtml!="")
		{
			stepsOption.innerHTML = stepContInnerHtml;
		}
		
		/*cellId.onfocusout = function(){
			console.log("cellId focusout");
			tempSTring +=  cellId.value;
			var select = document.getElementById("stepsSelect");
			select.options[select.selectedIndex].value = tempSTring;
		};*/
		
		var cellForStep = "";
		var saveStepDetBtn = mxUtils.button('Apply', function()
		{
			console.log('hi1');
			var AnimationType = document.getElementById("animationType");
		    var Opacity = document.getElementById("opacity");
		    var CellId = document.getElementById("cellId");
		    var OpacityForOthers = document.getElementById("opacityForOthers");
                    var divData = document.getElementById("container");
                    var imgData= divData.getElementsByTagName('img')[0];
                    var src = imgData.src;
		    //var cString=  AnimationType.options[AnimationType.selectedIndex].value + ',' + Opacity.value+ ',' +  cellId.value + ',' + OpacityForOthers.value;
                    var cString=  'animationtype-'+AnimationType.options[AnimationType.selectedIndex].value + 'opacity-' + Opacity.value+ 'celldet-' +  cellId.value + 'opacityothers-' + OpacityForOthers.value + 'img-' + src.substring(src.lastIndexOf(',') + 1);
		    var select = document.getElementById("stepsSelect");
			select.options[select.selectedIndex].value = cString;
			console.log('Cstring ' + cString);
			console.log(select.options[select.selectedIndex].value);
                    opacityValue.innerHTML = Opacity.value;
		    opacityForOthersValue.innerHTML = OpacityForOthers.value;
					
		});
		var noteLabel = document.createElement('label');
		noteLabel.id="noteLabel";
		noteLabel.innerHTML = "Note: Please click apply to save changes"
			
		table3td51.appendChild(saveStepDetBtn);
		table3td61.appendChild(noteLabel);
		
		table3tr5.appendChild(table3td51);
		table3tr6.appendChild(table3td61);
		
		table3tbody.appendChild(table3tr1);
		table3tbody.appendChild(table3tr2);
		table3tbody.appendChild(table3tr3);
		table3tbody.appendChild(table3tr4);
		table3tbody.appendChild(table3tr5);
		table3tbody.appendChild(table3tr6);
		
		table3.appendChild(table3tbody);

		var addTempStepBtn = mxUtils.button('Add Step', function()
		{
                         document.getElementById('container').innerHTML = '';
			 opacityForOthers.value=100;
			 opacity.value=100;
			var select = document.getElementById("stepsSelect");
			/*
			if (select.options.length >= 1)
			{
				console.log(select.options.length);
				var AnimationType = document.getElementById("animationType");
			    var Opacity = document.getElementById("opacity");
			    var CellId = document.getElementById("cellId");
				
			    var cString=  AnimationType.value + ',' + Opacity.value+ ',' + CellId.value;
				select.options[select.options.length-1].value = cString;
				
				AnimationType.value = "";
				Opacity.value = "";
				CellId.value = "";
				
			}*/
			
			
			var cells = editorUi.editor.graph.getSelectionCells();
			cellForStep = "";
			
			
			if (cells.length > 0)
			{
                            console.log("Selection exists");
                               // graph.getModel().clear();
                                
				for (var i = 0; i < cells.length; i++)
				{
                                        //graph.addCell(graph.cloneCells([cells[i]])[0]);
                                        //graph.getModel().setRoot(graph.cloneCells([cells[0]])[0]);
                                        
                                        
                                        //graph.maxFitScale = 0.6;
                                       // graph.fit(8);
                                        //graph.center();
					console.log(cells[i]);
                                        
                                        if(cells[i].vertex && cells[i].style!=null && !cells[i].style.includes("text"))
                                        {
                                        	if(cells[i].style.includes("container"))
                                        	{
                                        		if(cells[i].value)
                                        			{
                                        			cellForStep = cellForStep  + 'CellId ' + cells[i].id + ' celltext '+ cells[i].value  + '\n';
                                        			}
                                        		else
                                        			{
                                        			cellForStep = cellForStep + 'CellId ' + cells[i].id + ' celltext NoText' + '\n';
                                        			}
                                        		var descendants=editorUi.editor.graph.getModel().getDescendants(cells[i]);
                                                console.log("in container");
                                                for (var j = 0; j < descendants.length; j++)
                                                {
                                                    
                                                	if(descendants[j].parent.id==cells[i].id)
                                                	{
                                                		console.log("in desc");
                                                		if(descendants[j].value)
                                                			{
                                                			cellForStep = cellForStep + 'CellId ' + descendants[j].id + ' celltext '+ descendants[j].value  + '\n';
                                                			}
                                                		else
                                                			{
                                                			cellForStep = cellForStep + 'Cellid '+ descendants[j].id  + ' celltext NoText'+ '\n';
                                                			}
                                                	}
                                                }
                                        	}
                                        	else
                                        	{
                                            if(cells[i].value)
                                            {
                                            	cellForStep = cellForStep + 'CellId ' + cells[i].id + ' celltext '+ cells[i].value  + '\n';
                                            }
                                            else
                                            {
                                            	cellForStep = cellForStep +  'CellId '+ cells[i].id  + ' celltext ' + 'NoText' + '\n';
                                            }
                                        	}
                                        }
                                        else
                                        {
                                            if(cells[i].edge && (cells[i].value==null || cells[i].value==""))
                                            {
                                                   console.log("In edge cell value null or empty") ;
                                                   cellForStep = cellForStep + 'Cellid '+ cells[i].id  + ' celltext NoText' + '\n';
                                                    var descendants=editorUi.editor.graph.getModel().getDescendants(cells[i]);
                                                    if(descendants.length > 1)
                                                    {
                                                    for (var j = 0; j < descendants.length; j++)
                                                    {
                                                        console.log("Descendants exist: " + descendants.length + "Desc "+ i +" Value " + descendants[j].value);
                                                    	if(descendants[j].value && descendants[j].parent.id==cells[i].id)
                                                    	{
                                                    		console.log("Descendants exist if loop");
                                                    		if(descendants[j].value!="")
                                                    		{
                                                    			cellForStep = cellForStep + 'Cellid ' + descendants[j].id + ' celltext '+ descendants[j].value + '\n';
                                                    		} 
                                                    		/*else if(descendants[j].value=="" || descendants[j].value==null)
                                                        	{
                                                        		list.value = list.value + 'show NoText'  + ' cellid'+ cells[i].id + ' direct\n';
                                                        	}*/
                                                    	}
                                                    }
                                                    }
                                                    if(descendants==null || (descendants.length==1 && (descendants[0].value==null || descendants[0].value=="")))
                                                    {
                                                    	console.log("Descendants dont exists=");
                                                    	//cellForStep = cellForStep + 'CellText NoText'  + ' cellid '+ cells[i].id + '\n';
                                                   	}
                                            }
                                            else if(cells[i].edge && cells[i].value!=null)
                                            {
                                            	console.log("In edge cell value not empty") ;
                                            	cellForStep = cellForStep + 'Cellid ' + cells[i].id + ' celltext '+ cells[i].value  + '\n';
                                            }
                                            //text node
                                            else if(cells[i].vertex && cells[i].style.includes("text") && cells[i].value!=null)
                                            {
                                                cellForStep = cellForStep + 'Cellid ' + cells[i].id + ' celltext '+ cells[i].value  + '\n';
                                            }
                                            
                                        }                                       
				}
				
                                //var bounds = graph.getGraphBounds();
                                //container.width = bounds.width;
                                //container.height = bounds.height;
				var optionStepNumber = (select.options.length+1);
				var optionText = 'Slideshow Step' + ' ' + optionStepNumber;
				select.options[select.options.length] = new Option(optionText, 'Slideshow Step');
				select.options.selectedIndex = select.options.length-1;
				console.log(cellForStep);
				cellId.value = cellForStep;
				
				//var cString=  animationType.options[animationType.selectedIndex].value + ',' + opacity.value+ ',' +  cellId.value + ',' + opacityForOthers.value;
                               // var cString=  'animationtype-'+animationType.options[animationType.selectedIndex].value + 'opacity-' + opacity.value+ 'celldet-' +  cellId.value + 'opacityothers-' + opacityForOthers.value;
                                
                                
                                
                                
                                var cString; 
                                editorUi.exportToCanvas(mxUtils.bind(this, function(canvas)
			   	{
			   		try
			   		{
			   			var data=editorUi.getDataForPreview(canvas,  null, 'png');
                                                if(data != null)
                                                {
                                                    data= data.substring(data.lastIndexOf(',') + 1);
                                                    var preview = document.createElement('img');
                                                    preview.setAttribute('src', 'data:' + 'image/png' +  ';base64,' + data);
                                                    preview.style.maxWidth = '200px';
                                                    preview.style.maxHeight = '100px';
                                                    mxUtils.setPrefixedStyle(preview.style, 'transform');
                                                    container.appendChild(preview);
                                                    cString=  'animationtype-'+animationType.options[animationType.selectedIndex].value + 'opacity-' + opacity.value+ 'celldet-' +  cellId.value + 'opacityothers-' + opacityForOthers.value+'img-'+data;
                                                    console.log(cString);
                                                    select.options[select.selectedIndex].value = cString;
                                                    console.log("Add step value: ",select.options[select.selectedIndex].value);
                                                }
			   		}
			   		catch (e)
			   		{
			   			console.log("Error while creating data of graph");
			   		}
			   	}), null, null, null,null, null, false,  1, false,
			   		false, null, null, null, true);
                                        
                                opacityValue.innerHTML = opacity.value;
                                opacityForOthersValue.innerHTML = opacityForOthers.value;
                                
                                //var select = document.getElementById("stepsSelect");
				
		}
			
			else
				{
					alert ('No nodes selected! Please select atleast one node!!');
				}
		}
			);
		
		var removeBtn = mxUtils.button('Remove Step', function()
				{
					console.log('hi5');
					var select = document.getElementById("stepsSelect");
					select.options[select.selectedIndex] =null;
					animationType.options.selectedIndex = 0 ;
					opacity.value = 100;
					opacityValue.innerHTML = opacity.value;
					cellId.value = "";
					opacityForOthers.value = 100;
					opacityForOthersValue.innerHTML = opacityForOthers.value;
					document.getElementById('container').innerHTML = '';
                                        
					for (i=0; i< select.options.length ; i++)
					{
						var stepNumber = i+1;
						select.options[i].text = 'Slideshow Step' + ' ' + stepNumber;
					}
				});

		stepscontainer.appendChild(stepsOption);
		
		
		//parentcontainer.appendChild(stepscontainer);
		//parentcontainer.appendChild(container);
		
		var table2 = document.createElement('table');
		table2.style.width = '100%';
		table2.style.height = '100%';
		var table2tbody = document.createElement('tbody');
		var table2tr1 = document.createElement('tr');
		var table2td11 = document.createElement('td');
		table2td11.style.width = '140px';
		var table2td12 = document.createElement('td');
		
        /*
		table2td11.appendChild(stepscontainer);
		table2td12.appendChild(container);
		
		table2tr1.appendChild(table2td11);
		table2tr1.appendChild(table2td12);
		
		table2tbody.appendChild(table2tr1);
		table2.appendChild(table2tbody);
		
		td12.appendChild(table2);*/
		td11.appendChild(stepscontainer);
		td12.appendChild(table3);
		
		var graph = new Graph(container);
		graph.setEnabled(false);
		graph.setPanning(true);
		graph.foldingEnabled = false;
		graph.panningHandler.ignoreCell = true;
		graph.panningHandler.useLeftButtonForPanning = true;
		graph.minFitScale = null;
		graph.maxFitScale = null;
		graph.centerZoom = true;
                
                editorUi.selectPage(editorUi.pages[0]);
                
                var stepNumber=0;
                var addStepBtn = mxUtils.button('Add Step', function()
		{
                    stepNumber++;
                    list.value = list.value + 'Step '+ stepNumber+ '\n';
                });
                
               // td31.appendChild(addStepBtn);
                
                
        var simpleShowBtn = mxUtils.button('Show', function()
		{
        	
            var cells = editorUi.editor.graph.getSelectionCells();

			if (cells.length > 0)
			{
				for (var i = 0; i < cells.length; i++)
				{
					
                                        if(cells[i].vertex && cells[i].style!=null && !cells[i].style.includes("text"))
                                        {
                                        	if(cells[i].style.includes("container"))
                                        	{
                                        		if(cells[i].value)
                                        			{
                                        		list.value = list.value + 'show ' + cells[i].value + ' cellid'+ cells[i].id  + ' direct\n';
                                        			}
                                        		else
                                        			{
                                        			list.value = list.value + 'show NoText' + ' cellid'+ cells[i].id  + ' direct\n';
                                        			}
                                        		var descendants=editorUi.editor.graph.getModel().getDescendants(cells[i]);
                                                console.log("in container");
                                                for (var j = 0; j < descendants.length; j++)
                                                {
                                                    
                                                	if(descendants[j].parent.id==cells[i].id)
                                                	{
                                                		console.log("in desc");
                                                		if(descendants[j].value)
                                                			{
                                                		list.value = list.value + 'show ' + descendants[j].value + ' cellid'+ descendants[j].id  + ' direct\n';
                                                			}
                                                		else
                                                			{
                                                			list.value = list.value + 'show NoText'+ ' cellid'+ descendants[j].id  + ' direct\n';
                                                			}
                                                	}
                                                }
                                        	}
                                        	else
                                        	{
                                            if(cells[i].value)
                                            {
                                                list.value = list.value + 'show ' + cells[i].value + ' cellid'+ cells[i].id  + ' direct\n';
                                            }
                                            else
                                            {
                                            	list.value = list.value + 'show ' + 'NoText' + ' cellid'+ cells[i].id  + ' direct\n';
                                            }
                                        	}
                                        }
                                        else
                                        {
                                            if(cells[i].edge && (cells[i].value==null || cells[i].value==""))
                                            {
                                                   console.log("In edge cell value null or empty") ;
                                                    var descendants=editorUi.editor.graph.getModel().getDescendants(cells[i]);
                                                    if(descendants.length > 1)
                                                    {
                                                    for (var j = 0; j < descendants.length; j++)
                                                    {
                                                        console.log("Descendants exist: " + descendants.length + "Desc "+ i +" Value " + descendants[j].value);
                                                    	if(descendants[j].value && descendants[j].parent.id==cells[i].id)
                                                    	{
                                                    		console.log("Descendants exist if loop");
                                                    		if(descendants[j].value!="")
                                                    		{
                                                    			list.value = list.value + 'show ' + descendants[j].value + ' cellid'+ cells[i].id + ' direct\n';
                                                    		} 
                                                    		/*else if(descendants[j].value=="" || descendants[j].value==null)
                                                        	{
                                                        		list.value = list.value + 'show NoText'  + ' cellid'+ cells[i].id + ' direct\n';
                                                        	}*/
                                                    	}
                                                    }
                                                    }
                                                    if(descendants==null || (descendants.length==1 && (descendants[0].value==null || descendants[0].value=="")))
                                                    {
                                                    	console.log("Descendants dont exists=");
                                                    	list.value = list.value + 'show NoText'  + ' cellid'+ cells[i].id + ' direct\n';
                                                   	}
                                            }
                                            else if(cells[i].edge && cells[i].value!=null)
                                            {
                                            	console.log("In edge cell value not empty") ;
                                            	list.value = list.value + 'show ' + cells[i].value + ' cellid'+ cells[i].id  + ' direct\n';
                                            }
                                        }                                       
				}
				
				list.value = list.value + 'wait 1000\n';
			}
		});
		//td21.appendChild(simpleShowBtn);
                
                
		var fadeInBtn = mxUtils.button('Fade In', function()
		{

                    var cells = editorUi.editor.graph.getSelectionCells();

			if (cells.length > 0)
			{
				for (var i = 0; i < cells.length; i++)
				{
                                        if(cells[i].vertex && cells[i].style!=null && !cells[i].style.includes("text"))
                                        {
                                        	if(cells[i].style.includes("container"))
                                        	{
                                        		if(cells[i].value)
                                        			{
                                        		list.value = list.value + 'show ' + cells[i].value + ' cellid'+ cells[i].id  + ' fade\n';
                                        			}
                                        		else
                                        			{
                                        			list.value = list.value + 'show NoText' + ' cellid'+ cells[i].id  + ' fade\n';
                                        			}
                                        		var descendants=editorUi.editor.graph.getModel().getDescendants(cells[i]);
                                                console.log("in container");
                                                for (var j = 0; j < descendants.length; j++)
                                                {
                                                    
                                                	if(descendants[j].parent.id==cells[i].id)
                                                	{
                                                		console.log("in desc");
                                                		if(descendants[j].value)
                                                			{
                                                		list.value = list.value + 'show ' + descendants[j].value + ' cellid'+ descendants[j].id  + ' fade\n';
                                                			}
                                                		else
                                                			{
                                                			list.value = list.value + 'show NoText'+ ' cellid'+ descendants[j].id  + ' fade\n';
                                                			}
                                                	}
                                                }
                                        	}
                                        	else
                                        	{
                                            if(cells[i].value)
                                            {
                                                list.value = list.value + 'show ' + cells[i].value + ' cellid'+ cells[i].id  + ' fade\n';
                                            }
                                            else
                                            {
                                            	list.value = list.value + 'show NoText'  + ' cellid'+ cells[i].id  + ' fade\n';
                                            }
                                        	}
                                        }
                                        else
                                        {
                                            if(cells[i].edge && (cells[i].value==null || cells[i].value==""))
                                            {
                                                    
                                                    var descendants=editorUi.editor.graph.getModel().getDescendants(cells[i]);
                                                    if(descendants.length > 1)
                                                    {
                                                    for (var j = 0; j < descendants.length; j++)
                                                    {
                                                        
                                                    if(descendants[j].value && descendants[j].parent.id==cells[i].id)
                                                    {
                                                        if(descendants[j].value!="")
                                                        {
                                                            list.value = list.value + 'show ' + descendants[j].value + ' cellid'+ cells[i].id + ' fade\n';
                                                        } 
                                                        
                                                    }

                                                    }
                                                    }
                                                    if(descendants==null || (descendants.length==1 && (descendants[0].value==null || descendants[0].value=="")))
                                                    {
                                                    	console.log("Descendants dont exist");
                                                    	list.value = list.value + 'show NoText'  + ' cellid'+ cells[i].id + ' fade\n';
                                                   	}
                                            }
                                            else if(cells[i].edge && cells[i].value!=null)
                                            {
                                            	
                                            	list.value = list.value + 'show ' + cells[i].value + ' cellid'+ cells[i].id  + ' fade\n';
                                            }
                                        }                                 
				}
				
				list.value = list.value + 'wait 1000\n';
			}
		});
		//td21.appendChild(fadeInBtn);
		
		var animateBtn = mxUtils.button('Wipe In', function()
		{
			var cells = editorUi.editor.graph.getSelectionCells();
			
			if (cells.length > 0)
			{
				for (var i = 0; i < cells.length; i++)
				{
                                        if(cells[i].vertex && cells[i].style!=null && !cells[i].style.includes("text"))
                                        {
                                        	if(cells[i].style.includes("container"))
                                        	{
                                        		if(cells[i].value)
                                        			{
                                        		list.value = list.value + 'show ' + cells[i].value + ' cellid'+ cells[i].id  + '\n';
                                        			}
                                        		else
                                        			{
                                        			list.value = list.value + 'show NoText' + ' cellid'+ cells[i].id  + '\n';
                                        			}
                                        		var descendants=editorUi.editor.graph.getModel().getDescendants(cells[i]);
                                                console.log("in container");
                                                for (var j = 0; j < descendants.length; j++)
                                                {
                                                    
                                                	if(descendants[j].parent.id==cells[i].id)
                                                	{
                                                		console.log("in desc");
                                                		if(descendants[j].value)
                                                			{
                                                		list.value = list.value + 'show ' + descendants[j].value + ' cellid'+ descendants[j].id  + '\n';
                                                			}
                                                		else
                                                			{
                                                			list.value = list.value + 'show NoText'+ ' cellid'+ descendants[j].id  + '\n';
                                                			}
                                                	}
                                                }
                                        	}
                                        else
                                        	{
                                            if(cells[i].value)
                                            {
                                                list.value = list.value + 'show ' + cells[i].value + ' cellid'+ cells[i].id  + '\n';
                                            }
                                            else
                                            {
                                            	list.value = list.value + 'show NoText'  + ' cellid'+ cells[i].id  + '\n';
                                           	}
                                        	}
                                        }
                                        else
                                        {
                                            if(cells[i].edge && (cells[i].value==null || cells[i].value==""))
                                            {
                                                    
                                                    var descendants=editorUi.editor.graph.getModel().getDescendants(cells[i]);
                                                    if(descendants.length > 1)
                                                    {
                                                    for (var j = 0; j < descendants.length; j++)
                                                    {
                                                        
                                                    if(descendants[j].value && descendants[j].parent.id==cells[i].id)
                                                    {
                                                        if(descendants[j].value!="")
                                                        {
                                                            list.value = list.value + 'show ' + descendants[j].value + ' cellid'+ cells[i].id + '\n';
                                                        } 
                                                        
                                                    }
                                                    }
                                                    
                                                    }
                                                    if(descendants==null || (descendants.length==1 && (descendants[0].value==null || descendants[0].value=="")))
                                                    {
                                                    	console.log("Descendants dont exist");
                                                    	list.value = list.value + 'show NoText'  + ' cellid'+ cells[i].id + '\n';
                                                   	}
                                            }
                                            else if(cells[i].edge && cells[i].value!=null)
                                            {
                                            	
                                            	list.value = list.value + 'show ' + cells[i].value + ' cellid'+ cells[i].id  + '\n';
                                            }
                                        }
                                        
				}
				
				list.value = list.value + 'wait 1000\n';
			}
		});
		//td21.appendChild(animateBtn);
		
		var addBtn = mxUtils.button('Fade Out', function()
		{
			var cells = editorUi.editor.graph.getSelectionCells();
			
			if (cells.length > 0)
			{
				for (var i = 0; i < cells.length; i++)
				{
					if(cells[i].vertex  && cells[i].style!=null && !cells[i].style.includes("text"))
                    {
						if(cells[i].style.includes("container"))
                    	{
                    		if(cells[i].value)
                    			{
                    		list.value = list.value + 'hide ' + cells[i].value + ' cellid'+ cells[i].id  + '\n';
                    			}
                    		else
                    			{
                    			list.value = list.value + 'hide NoText' + ' cellid'+ cells[i].id  + '\n';
                    			}
                    		var descendants=editorUi.editor.graph.getModel().getDescendants(cells[i]);
                            console.log("in container");
                            for (var j = 0; j < descendants.length; j++)
                            {
                                
                            	if(descendants[j].parent.id==cells[i].id)
                            	{
                            		console.log("in desc");
                            		if(descendants[j].value)
                            			{
                            		list.value = list.value + 'hide ' + descendants[j].value + ' cellid'+ descendants[j].id  + '\n';
                            			}
                            		else
                            			{
                            			list.value = list.value + 'hide NoText'+ ' cellid'+ descendants[j].id  + '\n';
                            			}
                            	}
                            }
                    	}
						
						
						
					else
						{
                                            if(cells[i].value)
                                            {
                                                list.value = list.value + 'hide ' + cells[i].value + ' cellid'+ cells[i].id  + '\n';
                                            }
                                            else
                                            {
                                            	list.value = list.value + 'hide NoText'  + ' cellid'+ cells[i].id  + '\n';
                                            }
						}
                       					}
                                        else
                                        {
                                            if(cells[i].edge && (cells[i].value==null || cells[i].value==""))
                                            {
                                                    
                                                    var descendants=editorUi.editor.graph.getModel().getDescendants(cells[i]);
                                                    if(descendants.length > 1)
                                                    {
                                                    for (var j = 0; j < descendants.length; j++)
                                                    {
                                                        
                                                    if(descendants[j].value && descendants[j].parent.id==cells[i].id)
                                                    {
                                                        if(descendants[j].value!="")
                                                        {
                                                            list.value = list.value + 'hide ' + descendants[j].value + ' cellid'+ cells[i].id + '\n';
                                                        } 
                                                        
                                                    }
                                                    else
                                                    {
                                                    	list.value = list.value + 'hide NoText'  + ' cellid'+ cells[i].id + '\n';
                                                   	}
                                                    
                                                }
                                                    }
                                                    if(descendants==null || (descendants.length==1 && (descendants[0].value==null || descendants[0].value=="")))
                                                    {
                                                    	console.log("Descendants dont exist");
                                                    	list.value = list.value + 'hide NoText'  + ' cellid'+ cells[i].id + '\n';
                                                   	}
                                                    
                                            }
                                            else if(cells[i].edge && cells[i].value!=null)
                                            {
                                            	
                                            	list.value = list.value + 'hide ' + cells[i].value + ' cellid'+ cells[i].id  + '\n';
                                            }
                                        }
				}

				list.value = list.value + 'wait 1000\n';
			}
		});
		//td21.appendChild(addBtn);
		
		var waitBtn = mxUtils.button('Wait', function()
		{
			list.value = list.value + 'wait 1000\n';
		});
		//td21.appendChild(waitBtn);
		//td21.appendChild(saveStepDetBtn);
		 var clearBtn = mxUtils.button('Clear All Steps', function()
					{
			                   /* list.value = "";
			                    stepNumber=0;*/
                                   document.getElementById('container').innerHTML = '';
			    	   stepsOption.options.length = 0;
			    	   cellId.value = "";
			    	   opacity.value = 100;
					   opacityValue.innerHTML = opacity.value;
					   opacityForOthers.value = 100;
					   opacityForOthersValue.innerHTML = opacityForOthers.value;
			                });
		
		
		td21.appendChild(addTempStepBtn);
		td21.appendChild(removeBtn);
		td21.appendChild(clearBtn);
		
		var runBtn = mxUtils.button('Preview', function()
		{
			graph.getModel().clear();
			graph.getModel().setRoot(graph.cloneCells([editorUi.editor.graph.getModel().getRoot()])[0]);
			graph.maxFitScale = 1;
			graph.fit(8);
			graph.center();
			
			global_step=run(editorUi,graph, list.value.split('\n'));
		});
		//td21.appendChild(runBtn);
		
		var stopBtn = mxUtils.button('Stop', function()
		{
			graph.getModel().clear();
			stop();
		});
		//td21.appendChild(stopBtn);
                
		
               // var elem = null;
		var applyBtn = mxUtils.button('Apply', function()
		{
                    editorUi.selectPage(editorUi.pages[0]);
                    window.steps=0;
                    window.pageNo=0;
                    var presentation_container = document.createElement('div');
                    presentation_container.style.border = '1px solid lightGray';
                    presentation_container.style.background = '#ffffff';
                    presentation_container.style.width = '100%';
                    presentation_container.style.height = '100%';
                    presentation_container.style.overflow = 'auto';
                    
                    
                    
                    

                    var newgraph = new Graph(presentation_container);
                    newgraph.setEnabled(false);
                    newgraph.setPanning(true);
                    newgraph.foldingEnabled = false;
                    newgraph.panningHandler.ignoreCell = true;
                    newgraph.panningHandler.useLeftButtonForPanning = true;
                    newgraph.minFitScale = null;
                    newgraph.maxFitScale = null;
                    //newgraph.centerZoom = true;
                   // newgraph.zoom(2)
                    //newgraph.view.scaleAndTranslate(2)
                    //newgraph.fit();
                    //newgraph.center();
                  
                   // newgraph=editorUi.editor.graph;
                   
                    
                    newgraph.getModel().clear();
                    newgraph.getModel().setRoot(newgraph.cloneCells([editorUi.editor.graph.getModel().getRoot()])[0]);
                    var mapping = mapCell(editorUi.editor.graph.getModel().getRoot(), newgraph.getModel().getRoot());
                    newgraph.getModel().beginUpdate();
			try
			{
				for (var id in newgraph.getModel().cells)
				{
					var cell = newgraph.getModel().cells[id];
					console.log("Cell id after Model updated: "+ cell.id + " Value: " + cell.value + " Style: "+ cell.style);
					if (newgraph.getModel().isVertex(cell) || newgraph.getModel().isEdge(cell))
					{
						newgraph.setCellStyles('opacity', '0', [cell]);
						newgraph.setCellStyles('noLabel', '1', [cell]);
					}
				}
			}
			finally
			{
				newgraph.getModel().endUpdate();
			}
                    
                    document.body.appendChild(presentation_container);
                   // alert(newgraph.getModel().getRoot());
                    
                    /*
			editorUi.editor.graph.setAttributeForCell(root, 'animation', list.value);
                        //this.presentationwindow =new PresentationWindow();
                        //this.presentationwindow.window.setVisible(true);
                        /*this.window.moveTo(0, 0);

                        if (document.all) {
                            top.window.resizeTo(screen.availWidth, screen.availHeight);
                                          }

                        else if (document.layers || document.getElementById) {
                                if (top.window.outerHeight < screen.availHeight || top.window.outerWidth < screen.availWidth) {
                                        top.window.outerHeight = screen.availHeight;
                                        top.window.outerWidth = screen.availWidth;
                                        }
                                }*/
                        /*elem=container;
                       
                        
                        if (elem.requestFullscreen) {
                                    elem.requestFullscreen();
                                } else if (elem.mozRequestFullScreen) { /* Firefox */
                                  /*  elem.mozRequestFullScreen()
                        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                                /*    elem.webkitRequestFullscreen();
                        } else if (elem.msRequestFullscreen) { /* IE/Edge */
                                  /*  elem.msRequestFullscreen();
  
                        }*/
                        
                        //Uncomment below code to auto run animation
                        /*
                        editorUi.editor.graph.setAttributeForCell(root, 'animation', list.value);
                        
                        elem=container;
                       
                        
                        if (elem.requestFullscreen) {
                                    elem.requestFullscreen();
                                } else if (elem.mozRequestFullScreen) { 
                                    elem.mozRequestFullScreen();
                        } else if (elem.webkitRequestFullscreen) {  
                                    elem.webkitRequestFullscreen();
                        } else if (elem.msRequestFullscreen) { 
                                    elem.msRequestFullscreen();
  
                        }
                        graph.getModel().clear();
			graph.getModel().setRoot(graph.cloneCells([editorUi.editor.graph.getModel().getRoot()])[0]);
                        graph.maxFitScale = 1;
                        graph.fit(8);
                        graph.center();
               
            
			run(editorUi,graph, list.value.split('\n'));
                        */
                        
                        
                        elem=presentation_container;
                       
                        editorUi.editor.graph.setAttributeForCell(root, 'animation', list.value);
                        editorUi.editor.graph.setAttributeForCell(root, 'steps',stepsOption.innerHTML );
                        
                        if (elem.requestFullscreen) {
                             
                                    elem.requestFullscreen();
                                } else if (elem.mozRequestFullScreen) { 
                                   
                                    elem.mozRequestFullScreen();
                        } else if (elem.webkitRequestFullscreen) {  
                            
                                    elem.webkitRequestFullscreen();
                        } else if (elem.msRequestFullscreen) { 
                            
                                    elem.msRequestFullscreen();
  
                        }
                        
                      
                    var margin = 2;
                    var max = 1.5;

                    var bounds = newgraph.getGraphBounds();
                    var cw = newgraph.container.clientWidth - margin;
                    var ch = newgraph.container.clientHeight - margin;
                    var w = bounds.width / newgraph.view.scale;
                    var h = bounds.height / newgraph.view.scale;
                    var s = Math.min(max, Math.min(cw / w, ch / h));

                    newgraph.view.scaleAndTranslate(s,
                    (margin + cw - w * s) / (2 * s) - bounds.x / newgraph.view.scale,
                    (margin + ch - h * s) / (2 * s) - bounds.y / newgraph.view.scale);
                        
                     
                        var tempgraph=newgraph;
                        grpStepDetails=[];
                        //var mapping = mapCell(editorUi.editor.graph.getModel().getRoot(), newgraph.getModel().getRoot());
                        mxEvent.addListener(elem, 'click', function(evt)
						{
                                  window.steps++;
                                                    //alert(list.value);
                                  if(list.value!=null)
                                  {
                                     grpStepDetails=list.value.trim().split(/Step/);
                                  }
                                  
                                  if(grpStepDetails.length == window.steps)
                                  {
                                     if (document.exitFullscreen) 
                                     {
                                          document.exitFullscreen();
                                                            
                                     } 
                                     else if (document.mozCancelFullScreen)
                                     { /* Firefox */
                                          document.mozCancelFullScreen();
                                     }
                                     else if (document.webkitExitFullscreen) 
                                     { /* Chrome, Safari and Opera */
                                          document.webkitExitFullscreen();
                                     } 
                                     else if (document.msExitFullscreen)
                                     { /* IE/Edge */
                                          document.msExitFullscreen();
                                     }
                                   }
                                  
                                    if(grpStepDetails[window.steps]!=null)
                                    {
                                    	console.log("Grouped Step "+ grpStepDetails[window.steps]);
                                        stepDetails=grpStepDetails[window.steps].trim().split('\n');
                                        
                                    }
                                    var mapping = mapCell(editorUi.editor.graph.getModel().getRoot(), tempgraph.getModel().getRoot());
                                    for(x=1; x<stepDetails.length; x++)
                                    {
                                    	console.log("Individual Step " + stepDetails[x]);
                                        var tokens = stepDetails[x].split(' ');
                                        //graph.getModel().clear();
                                       //graph.getModel().setRoot(graph.cloneCells([editorUi.editor.graph.getModel().getRoot()])[0]);
                                        if (tokens.length > 0)
                                        {
                                            if (tokens[0] == 'wait' && tokens.length > 1)
                                            {
                                                                continue;
                                            }
                                            else if(tokens[0] == 'NextPage')
                                            {
                                                                window.pageNo++;
                                                                
                                                               // var tempGraph=newgraph;
                                                                
                                                                tempGraph.getModel().setRoot(editorUi.pages[window.pageNo].root);
                                                                
                                                                tempGraph.getModel().beginUpdate();
                                                                try
                                                                {
                                                                    for (var id in tempGraph.getModel().cells)
                                                                    {
                                                                        var cell = tempGraph.getModel().cells[id];
					
                                                                        if (tempGraph.getModel().isVertex(cell) || tempGraph.getModel().isEdge(cell))
                                                                        {
                                                                            tempGraph.setCellStyles('opacity', '0', [cell]);
                                                                            tempGraph.setCellStyles('noLabel', '1', [cell]);
                                                                        }
                                                                    }
                                                                }
                                                                finally
                                                                {
                                                                    tempGraph.getModel().endUpdate();
                                                                }
                                                                
                                                                var margin = 2;
                                                                var max = 1.5;
                                                                var bounds = tempGraph.getGraphBounds();
                                                                var cw = tempGraph.container.clientWidth - margin;
                                                                var ch = tempGraph.container.clientHeight - margin;
                                                                var w = bounds.width / tempGraph.view.scale;
                                                                var h = bounds.height / tempGraph.view.scale;
                                                                var s = Math.min(max, Math.min(cw / w, ch / h));

                                                                tempGraph.view.scaleAndTranslate(s,
                                                                                    (margin + cw - w * s) / (2 * s) - bounds.x / tempGraph.view.scale,
                                                                                    (margin + ch - h * s) / (2 * s) - bounds.y / tempGraph.view.scale);
                                                    /*
                                                                tokens = stepDetails[window.steps].split(' ');
                                                   //alert(stepDetails[window.steps]);
                                                    if (tokens.length > 1)
							{
                                                            //alert(window.steps);
								var cell = tempGraph.getModel().getCell(tokens[2].substring(6));
								
								if (cell != null)
								{
                                                                        //alert('Cell found');
									if (tokens[0] == 'show')
									{
										tempGraph.setCellStyles('opacity', '100', [cell]);
										tempGraph.setCellStyles('noLabel', null, [cell]);
										
										if (tokens.length > 2 && tokens[3] == 'fade')
										{
                                                                                        //alert('in fade');
											
                                                                                                //alert('timeout');
                                                                                                fadeIn(getNodesForCells(tempGraph, [cell]))
                                                                                                window.steps++;
                                                                                        
										}
                                                                                else if(tokens.length > 2 && tokens[3] == 'direct')
                                                                                {
                                                                                    window.steps++;
                                                                                }
										else
										{
											animateCells(tempGraph, [cell]);
                                                                                        window.steps++;
										}
                                                                                 
									}
									else if (tokens[0] == 'hide')
									{
                                                                                tempGraph.setCellStyles('opacity', '100', [cell]);
										tempGraph.setCellStyles('noLabel', null, [cell]);
										fadeOut(getNodesForCells(tempGraph, [cell]));
                                                                                window.steps++;
									}
                                                                       
								}
								else
								{
                                                                    //alert('1');
                                                                        alert('Something went wrong!');
									console.log('cell not found', id, steps[step]);
								}
							}*/
                                            }
                                            else
                                            {
                                            	if (tokens.length > 1)
                                            	{ 
                            	//alert(tokens[2].substring(6));
                                            		//var cell = tempgraph.getModel().getCell(tokens[2].substring(6));
                                            		var cell = mapping[tokens[2].substring(6)];
                                            		if (cell != null)
                                            		{
                                            			console.log("Cell id: "+ cell.id + " Cell Edge: "+ cell.edge + " Cell Vertex: " + cell.vertex)  ;  
                                            			console.log("Cell edge : "+ cell.isEdge());
                                            			//alert('Cell found');
                                            			if (tokens[0] == 'show')
                                            			{
                                            				tempgraph.setCellStyles('opacity', '100', [cell]);
                                            				tempgraph.setCellStyles('noLabel', null, [cell]);
										
                                            				if (tokens.length > 2 && tokens[3] == 'fade')
                                            				{
                                            					fadeIn(getNodesForCells(tempgraph, [cell])  )                                              
                                            				}
                                            				else if(tokens.length > 2 && tokens[3] == 'direct')
                                            				{                                    
                                            					if(cell.edge)
                                            					{
                                            						console.log("is edge");
                                            						var descendants=editorUi.editor.graph.getModel().getDescendants(cell);
                                            						for (var j = 0; j < descendants.length; j++)
                                            						{  
                                            							console.log("Descendants of Cell: "+cell.id + " Descendant Parent Id: "+descendants[j].parent.id + " Desc Value: "+descendants[j].value);
                                            							if(descendants.length > 0 && descendants[j].parent.id==cell.id)
                                            							{
                                            								if(descendants[j].value)
                                            								{
                                            									tempgraph.setCellStyles('opacity', '100', [descendants[j]]);
                                            									tempgraph.setCellStyles('noLabel', null, [descendants[j]]);
                                            								} 
                                            							}                                         
                                            						}
                                            					}
                                            					else
                                            					{
                                            						console.log("is not edge")
                                            					}
                                            				}
                                            				else
                                            				{
                                            					animateCells(tempgraph, [cell]);
                                                                                      
                                            				}
                                                                                 
                                            		}
                                            		else if (tokens[0] == 'hide')
                                            		{
                                            			tempgraph.setCellStyles('opacity', '100', [cell]);
                                        				tempgraph.setCellStyles('noLabel', null, [cell]);
                                            			fadeOut(getNodesForCells(tempgraph, [cell]));
                                                                              
                                            		}
                                                                       
                                            	}
                                            	else
                                            	{
                                            		alert('Something went wrong!');
										//console.log('cell not found', id, steps[step]);
                                            	}
                                            	}
                                                        
                                           }
                                                    //alert(window.steps);
                                                    
                            }
                        }
                                                
                                                //list.value= list.value + 'S ' +window.steps + 'G ' + grpStepDetails.length + '\n';
							
						});
                                                
                       
                        
                        
                        
            	});
                
        var nextPageBtn = mxUtils.button('Next Page', function()
		{
                    list.value = list.value + 'NextPage\n';
                });
        
        
        
                                                        
                               
                                
                                
                             
                
               /* var refreshBtn = mxUtils.button('Refresh ', function()
		{
                    editorUi.editor.graph.getModel().setRoot(  editorUi.editor.graph.cloneCells([editorUi.pages[0].root])[0]);
                    root=editorUi.editor.graph.getModel().getRoot();
                    
                    
                  //alert();
		if (root.value != null && typeof(root.value) == 'object')
		{
                        
                        //graph.getModel().clear();
			//graph.getModel().setRoot(graph.cloneCells([editorUi.editor.graph.getModel().getRoot()])[0]);
                        //alert(root.value.getAttribute('animation'));
			list.value = root.value.getAttribute('animation');
			if(list.value!=null)
				{
                        grpStepDetails=list.value.trim().split(/Step/);
				}
                        if(grpStepDetails.length > 0)
                        {
                            stepNumber=grpStepDetails.length-1;
                        }
                        else
                        {
                            stepNumber=0;
                        }
                        
                        if(root.value.getAttribute('animation')==null || root.value.getAttribute('animation')=="")
                        {
                            list.value="";
                        }
		}
                else
                {
                    list.value= "";
                }
                
                    
                });*/
        
        
        var testapplyBtn = mxUtils.button('Start Slideshow', function()
        		{
                            editorUi.selectPage(editorUi.pages[0]);
                            window.steps=0;
                            window.pageNo=0;
                            var presentation_container = document.createElement('div');
                            presentation_container.style.border = '1px solid lightGray';
                            presentation_container.style.background = '#ffffff';
                            presentation_container.style.width = '100%';
                            presentation_container.style.height = '100%';
                            presentation_container.style.overflow = 'auto';
                            
                            var newgraph = new Graph(presentation_container);
                            newgraph.setEnabled(false);
                            newgraph.setPanning(true);
                            newgraph.foldingEnabled = false;
                            newgraph.panningHandler.ignoreCell = true;
                            newgraph.panningHandler.useLeftButtonForPanning = true;
                            newgraph.minFitScale = null;
                            newgraph.maxFitScale = null;
                            //newgraph.centerZoom = true;
                           // newgraph.zoom(2)
                            //newgraph.view.scaleAndTranslate(2)
                            //newgraph.fit();
                            //newgraph.center();
                          
                           // newgraph=editorUi.editor.graph;
                           
                            
                            newgraph.getModel().clear();
                            newgraph.getModel().setRoot(newgraph.cloneCells([editorUi.editor.graph.getModel().getRoot()])[0]);
                            var mapping = mapCell(editorUi.editor.graph.getModel().getRoot(), newgraph.getModel().getRoot());
                            newgraph.getModel().beginUpdate();
        			try
        			{
        				for (var id in newgraph.getModel().cells)
        				{
        					var cell = newgraph.getModel().cells[id];
        					console.log("Cell id after Model updated: "+ cell.id + " Value: " + cell.value + " Style: "+ cell.style);
        					if (newgraph.getModel().isVertex(cell) || newgraph.getModel().isEdge(cell))
        					{
        						newgraph.setCellStyles('opacity', '0', [cell]);
        						newgraph.setCellStyles('noLabel', '1', [cell]);
        					}
        				}
        			}
        			finally
        			{
        				newgraph.getModel().endUpdate();
        			}
        			
        			dictSteps={};
        			for (i=0; i < stepsOption.options.length; i++)
              	  	{
        				var stepDetails=[];
              		  	if(stepsOption.options[i]!=null && stepsOption.options[i].value!=null)
                        {
                        	console.log("Step "+ stepsOption.options[i].value);

                                var n = stepsOption.options[i].value.indexOf("animationtype-");
                                var n1 = stepsOption.options[i].value.indexOf("opacity-");
                                var n2 = stepsOption.options[i].value.indexOf("celldet-");
                                var n3 = stepsOption.options[i].value.indexOf("opacityothers-");
                                var n4= stepsOption.options[i].value.indexOf("img-");
                                n1Len = ("animationtype-").length;
                                n2Len = ("opacity-").length;
                                n3Len = ("celldet-").length;
                                n4Len = ("opacityothers-").length;
                                n5Len = ("img-").length;
                                
                                var stepDetails=[];
                                animType= stepsOption.options[i].value.substring(n+n1Len,n1);
                                stepDetails.push(animType);
                                opacityVal = stepsOption.options[i].value.substring(n1+n2Len,n2);
                                stepDetails.push(opacityVal);
                                cellDet = stepsOption.options[i].value.substring(n2+n3Len,n3);
                                stepDetails.push(cellDet);
                                opacityRestVal = stepsOption.options[i].value.substring(n3+n4Len,n4);
                                stepDetails.push(opacityRestVal);
                                console.log("StepDetails array: ",stepDetails);
                                
                                
                        	//stepDetails = stepsOption.options[i].value.split(',');
                        }
              		  	
              		  var grpSteps =[];
                      if((stepDetails!==null || stepDetails!=='undefined') && stepDetails.length >=2)
                      {
                      	grpSteps = stepDetails[2].split('\n');
                      	console.log("Group steps length: ",grpSteps.length);
                      }
              		  	
              		  var cellsSelected=[];
                      for(x=0; x<= grpSteps.length-1; x++)
                      {
                      	console.log("Individual Step " + grpSteps[x]);
                          var tokens = grpSteps[x].split(' ');
                         
                          if (tokens.length > 1)
                          {
                          	cellsSelected.push(tokens[1]);
                          }
                      }
                      
                      dictSteps[i]=cellsSelected;
              		  	
              	  	}
        			
        			console.log(dictSteps);
                            
                            document.body.appendChild(presentation_container);
                                               
                                
                                elem=presentation_container;
                               
                                editorUi.editor.graph.setAttributeForCell(root, 'animation', list.value);
                                editorUi.editor.graph.setAttributeForCell(root, 'steps',stepsOption.innerHTML );
                                
                                if (elem.requestFullscreen) {
                                     
                                            elem.requestFullscreen();
                                        } else if (elem.mozRequestFullScreen) { 
                                           
                                            elem.mozRequestFullScreen();
                                } else if (elem.webkitRequestFullscreen) {  
                                    
                                            elem.webkitRequestFullscreen();
                                } else if (elem.msRequestFullscreen) { 
                                    
                                            elem.msRequestFullscreen();
          
                                }
                                
                              
                            var margin = 10;
                            var max = 1.5;

                            var bounds = newgraph.getGraphBounds();
                            var cw = newgraph.container.clientWidth - margin;
                            var ch = newgraph.container.clientHeight - margin;
                            var w = bounds.width / newgraph.view.scale;
                            var h = bounds.height / newgraph.view.scale;
                            var s = Math.min(max, Math.min(cw / w, ch / h));

                            newgraph.view.scaleAndTranslate(s,
                            (margin + cw - w * s) / (2 * s) - bounds.x / newgraph.view.scale,
                            (margin + ch - h * s) / (2 * s) - bounds.y / newgraph.view.scale);
                                
                             
                                var tempgraph=newgraph;
                                grpStepDetails=[];
                               // var mapping = mapCell(editorUi.editor.graph.getModel().getRoot(), newgraph.getModel().getRoot());
                                mxEvent.addListener(elem, 'click', function(evt)
        						{
                                          window.steps++;
                                                            //alert(list.value);
                                          
                                          
                                          if( (stepsOption.options!=null || stepsOption.options!='undefined') && stepsOption.options.length+1 == window.steps)
                                          {
                                             if (document.exitFullscreen) 
                                             {
                                                  document.exitFullscreen();
                                                                    
                                             } 
                                             else if (document.mozCancelFullScreen)
                                             { /* Firefox */
                                                  document.mozCancelFullScreen();
                                             }
                                             else if (document.webkitExitFullscreen) 
                                             { /* Chrome, Safari and Opera */
                                                  document.webkitExitFullscreen();
                                             } 
                                             else if (document.msExitFullscreen)
                                             { /* IE/Edge */
                                                  document.msExitFullscreen();
                                             }
                                           }
                                          
                                           /* var stepDetails=[];
                                            if(stepsOption.options[window.steps-1]!=null && stepsOption.options[window.steps-1].value!=null)
                                            {
                                            	console.log("Step "+ stepsOption.options[window.steps-1].value);
                                            	
                                            	stepDetails = stepsOption.options[window.steps-1].value.split(',');
                                            }*/
                                            //var mapping = mapCell(editorUi.editor.graph.getModel().getRoot(), tempgraph.getModel().getRoot());
                                            
                                           /* var grpSteps =[];
                                            if((stepDetails!=null || stepDetails!='undefined') && stepDetails.length >=2)
                                            {
                                            	grpSteps = stepDetails[2].split('\n');
                                            	
                                            }*/
                                            
                                            
                                            
                                            /*var cellsSelected=[];
                                            for(x=0; x<= grpSteps.length-1; x++)
                                            {
                                            	console.log("Individual Step " + grpSteps[x]);
                                                var tokens = grpSteps[x].split(' ');
                                               
                                                if (tokens.length > 1)
                                                {
                                                	cellsSelected.push(tokens[3]);
                                                	/*if (tokens.length > 1)
                                                	{
                                                		console.log(tokens[3]);
                                                		var cell = mapping[tokens[3]];
                                                		if (cell != null)
                                                		{
                                                			console.log("Cell id: "+ cell.id + " Cell Edge: "+ cell.edge + " Cell Vertex: " + cell.vertex)  ;  
                                                			console.log("Cell edge : "+ cell.isEdge());
                                                			//alert('Cell found');
                                                			if (stepDetails[0] == 'Show')
                                                			{
                                                				tempgraph.setCellStyles('opacity', stepDetails[1], [cell]);
                                                				tempgraph.setCellStyles('noLabel', null, [cell]);
    										                                    
                                                					if(cell.edge)
                                                					{
                                                						console.log("is edge");
                                                						var descendants=editorUi.editor.graph.getModel().getDescendants(cell);
                                                						for (var j = 0; j < descendants.length; j++)
                                                						{  
                                                							console.log("Descendants of Cell: "+cell.id + " Descendant Parent Id: "+descendants[j].parent.id + " Desc Value: "+descendants[j].value);
                                                							if(descendants.length > 0 && descendants[j].parent.id==cell.id)
                                                							{
                                                								if(descendants[j].value)
                                                								{
                                                									tempgraph.setCellStyles('opacity', stepDetails[1], [descendants[j]]);
                                                									tempgraph.setCellStyles('noLabel', null, [descendants[j]]);
                                                								} 
                                                							}                                         
                                                						}
                                                					}
                                                					else
                                                					{
                                                						console.log("is not edge")
                                                					}
                                                			}
                                                			else if(stepDetails[0] == 'Wipe In' )
                                                			{
                                                				tempgraph.setCellStyles('opacity', stepDetails[1], [cell]);
                                                				tempgraph.setCellStyles('noLabel', null, [cell]);
                                            					animateCells(tempgraph, [cell]);
                                                                                      
                                                			}
                                                			else if (stepDetails[0] == 'Fade In')
                                                			{
                                                				tempgraph.setCellStyles('opacity', stepDetails[1], [cell]);
                                                				tempgraph.setCellStyles('noLabel', null, [cell]);
                                            					fadeIn(getNodesForCells(tempgraph, [cell])  )                                              
                                                			}
                                                			else if (stepDetails[0] == 'Fade Out')
                                                			{
                                                				tempgraph.setCellStyles('opacity', stepDetails[1], [cell]);
                                                				tempgraph.setCellStyles('noLabel', null, [cell]);
                                                				fadeOut(getNodesForCells(tempgraph, [cell]));
                                                                                  
                                                			}
                                                			
                                                		}
                                                		else
                                                    	{
                                                    		alert('Something went wrong!');
        										//console.log('cell not found', id, steps[step]);
                                                    	}
                                                	}
                                                	
                                                }
                                            }//for
                                            console.log(cellsSelected);*/
                                            var cellsInPrevSteps = [];
                                            var allCellsInPrevStep =[];
                                            if( window.steps > 1)
                                            {
                                            	for(i = 0; i < window.steps-1 ; i++ )
                                            	{
                                            		var temp = dictSteps[i];
                                            		cellsInPrevSteps=allCellsInPrevStep.concat(temp);
                                            		allCellsInPrevStep=cellsInPrevSteps;
                                            	}
                                            	 console.log("Cells in prev step" + cellsInPrevSteps);
                                            }
                                            
                                            //var x = stepsOption.options[window.steps-1].value.split(',');
                                            
                                            var n = stepsOption.options[window.steps-1].value.indexOf("animationtype-");
                                            var n1 = stepsOption.options[window.steps-1].value.indexOf("opacity-");
                                            var n2 = stepsOption.options[window.steps-1].value.indexOf("celldet-");
                                            var n3 = stepsOption.options[window.steps-1].value.indexOf("opacityothers-");
                                            var n4= stepsOption.options[window.steps-1].value.indexOf("img-");
                                            n1Len = ("animationtype-").length;
                                            n2Len = ("opacity-").length;
                                            n3Len = ("celldet-").length;
                                            n4Len = ("opacityothers-").length;
                                
                                            var x=[];
                                            animType= stepsOption.options[window.steps-1].value.substring(n+n1Len,n1);
                                            x.push(animType);
                                            opacityVal = stepsOption.options[window.steps-1].value.substring(n1+n2Len,n2);
                                            x.push(opacityVal);
                                            cellDet = stepsOption.options[window.steps-1].value.substring(n2+n3Len,n3);
                                            x.push(cellDet);
                                            opacityRestVal = stepsOption.options[window.steps-1].value.substring(n3+n4Len,n4);
                                            x.push(opacityRestVal);
                                            console.log("StepDetails array: ",x);
                                            
                                            
                                            
                                            
                                            var prevStepsOpacity = x[3];
                                            
                                            console.log("Previous Step Opacity: " + x[3]);
                                            console.log("Current Step Opacity: " + x[1]);
                                            
                                            if (cellsInPrevSteps!=null || cellsInPrevSteps!='undefined')
                                            {

                                            for (i=0; i< cellsInPrevSteps.length; i++)
                            				{
                                            	console.log("Previous Step Id " + cellsInPrevSteps[i]) ;
                        						var cell = mapping[cellsInPrevSteps[i]];
                        						
                        						
                        						 
                        						 if (cell != null)
                                         		 {
                        							 if (tempgraph.getModel().isVertex(cell) && (cell.value!=null ) )
                                 					{
                        								 console.log("Vertex with value") ;
                             							tempgraph.setCellStyles('opacity', x[3] , [cell]);
                             							//tempgraph.setCellStyles('noLabel', 1 , [cell]);
                             							if(stepDetails[3]==0)
                             								{
                             								tempgraph.setCellStyles('noLabel', 1 , [cell]);
                             								}
                             							else
                             								{
                             							tempgraph.setCellStyles(mxConstants.STYLE_TEXT_OPACITY, x[3] , [cell]);
                             								}
                             							
                                 					}
                        							 else if(tempgraph.getModel().isVertex(cell) && (cell.value==null || cell.value==""))
                        							{
                        								 console.log("Vertex with no value") ;
                        								 	tempgraph.setCellStyles('opacity', x[3] , [cell]);
                        								 	tempgraph.setCellStyles('noLabel', null , [cell]);
                        								 	tempgraph.setCellStyles(mxConstants.STYLE_TEXT_OPACITY, x[3] , [cell]);
                        							}
                        							 else if(tempgraph.getModel().isEdge(cell))
                        							{
                        								 console.log("Edge ") ;
                        								tempgraph.setCellStyles('opacity', x[3], [cell]);
                                          				//tempgraph.setCellStyles('noLabel', null, [cell]);
                                          				//tempgraph.setCellStyles(mxConstants.STYLE_TEXT_OPACITY, stepDetails[3] , [cell]);
                                          				
                                          				if(cell.value!=null)
                                          					{
                                          					if(x[3]==0)
                             								{
                             								tempgraph.setCellStyles('noLabel', 1 , [cell]);
                             								}
                             							else
                             								{
                             							tempgraph.setCellStyles(mxConstants.STYLE_TEXT_OPACITY, x[3] , [cell]);
                             								}
                                          					}
                                          				else
                                          					{
                                          				
                        								var descendants=editorUi.editor.graph.getModel().getDescendants(cell);
                                  						for (var j = 0; j < descendants.length; j++)
                                  						{  
                                  							 
                                  							if(descendants.length > 0 && descendants[j].parent.id==cell.id)
                                  							{
                                  								if(descendants[j].value)
                                  								{
                                  									console.log("Edge desc") ;
                                  									tempgraph.setCellStyles('opacity', x[3], [descendants[j]]);
                                  									//tempgraph.setCellStyles('noLabel', 1, [descendants[j]]);
                                  									if(stepDetails[3]==0)
                                     								{
                                  										tempgraph.setCellStyles('noLabel', 1 ,[descendants[j]]);
                                     								}
                                  									else
                                     								{
                                  									tempgraph.setCellStyles(mxConstants.STYLE_TEXT_OPACITY, x[3], [descendants[j]]);
                                     								}
                                  								} 
                                  							}                                         
                                  						}
                                          					}
                        							}
                        							 
                        							// 
                                         		 }
                            				}
                                            }
                                            
                                            var cellsInThisSteps = dictSteps[window.steps-1];
                                            console.log("Cells in this step" + cellsInThisSteps);
                                            
                                            if (cellsInThisSteps!=null || cellsInThisSteps!='undefined')
                                            {
                                            for (i=0; i< cellsInThisSteps.length; i++)
                            				{
                            					//var cell = tempgraph.getModel().cells[id];
                            					
                            					
                            						console.log("Current Step Id " + cellsInThisSteps[i]) ;
                            						var cell = mapping[cellsInThisSteps[i]];
                            						 
                            						 if (cell != null)
                                             		 {
                                             			console.log("Cell id: "+ cell.id + " Cell Edge: "+ cell.edge + " Cell Vertex: " + cell.vertex)  ;  
                                             			console.log("Cell edge : "+ cell.isEdge());
                                             			//alert('Cell found');
                                             			if (stepDetails[0] == 'Show')
                                             			{
                                             				tempgraph.setCellStyles('opacity', x[1], [cell]);
                                             				tempgraph.setCellStyles('noLabel', null, [cell]);
                                             				tempgraph.setCellStyles(mxConstants.STYLE_TEXT_OPACITY, x[1] , [cell]);
     									                                    
                                             					/*if(cell.edge)
                                             					{
                                             						console.log("is edge");
                                             						var descendants=editorUi.editor.graph.getModel().getDescendants(cell);
                                             						for (var j = 0; j < descendants.length; j++)
                                             						{  
                                             							console.log("Descendants of Cell: "+cell.id + " Descendant Parent Id: "+descendants[j].parent.id + " Desc Value: "+descendants[j].value);
                                             							if(descendants.length > 0 && descendants[j].parent.id==cell.id)
                                             							{
                                             								if(descendants[j].value)
                                             								{
                                             									tempgraph.setCellStyles('opacity', stepDetails[1], [descendants[j]]);
                                             									tempgraph.setCellStyles('noLabel', null, [descendants[j]]);
                                             								} 
                                             							}                                         
                                             						}
                                             					}
                                             					else
                                             					{
                                             						console.log("is not edge")
                                             					}*/
                                             			}
                                             			else if(stepDetails[0] == 'Wipe In' )
                                             			{
                                             				tempgraph.setCellStyles('opacity', x[1], [cell]);
                                             				tempgraph.setCellStyles('noLabel', null, [cell]);
                                             				tempgraph.setCellStyles(mxConstants.STYLE_TEXT_OPACITY, x[1] , [cell]);
                                             				animateCells(tempgraph, [cell]);
                                             				
                                             				/*if(cell.edge)
                                         					{
                                         						console.log("is edge");
                                         						var descendants=editorUi.editor.graph.getModel().getDescendants(cell);
                                         						for (var j = 0; j < descendants.length; j++)
                                         						{  
                                         							console.log("Descendants of Cell: "+cell.id + " Descendant Parent Id: "+descendants[j].parent.id + " Desc Value: "+descendants[j].value);
                                         							if(descendants.length > 0 && descendants[j].parent.id==cell.id)
                                         							{
                                         								if(descendants[j].value)
                                         								{
                                         									console.log(descendants[j].id);
                                         									edgeTextNode = mapping[descendants[j].id];
                                         									tempgraph.setCellStyles('opacity', stepDetails[1], [edgeTextNode]);
                                         									tempgraph.setCellStyles('noLabel',null, [edgeTextNode]);
                                         									animateCells(tempgraph, [edgeTextNode]);
                                         								} 
                                         							}                                         
                                         						}
                                         					}
                                         					else
                                         					{
                                         						console.log("is not edge")
                                         					}*/
                                             				
                                         					
                                                                                   
                                             			}
                                             			else if (stepDetails[0] == 'Fade In')
                                             			{
                                             				tempgraph.setCellStyles('opacity', x[1], [cell]);
                                             				tempgraph.setCellStyles('noLabel', null, [cell]);
                                             				tempgraph.setCellStyles(mxConstants.STYLE_TEXT_OPACITY, x[1] , [cell]);
                                         					fadeIn(getNodesForCells(tempgraph, [cell])  ) 
                                         					
                                         					/*if(cell.edge)
                                         					{
                                         						console.log("is edge");
                                         						var descendants=editorUi.editor.graph.getModel().getDescendants(cell);
                                         						for (var j = 0; j < descendants.length; j++)
                                         						{  
                                         							console.log("Descendants of Cell: "+cell.id + " Descendant Parent Id: "+descendants[j].parent.id + " Desc Value: "+descendants[j].value);
                                         							if(descendants.length > 0 && descendants[j].parent.id==cell.id)
                                         							{
                                         								if(descendants[j].value)
                                         								{
                                         									console.log(descendants[j].id);
                                         									edgeTextNode = mapping[descendants[j].id];
                                         									tempgraph.setCellStyles('opacity', stepDetails[1], [edgeTextNode]);
                                         									tempgraph.setCellStyles('noLabel', null, [edgeTextNode]);
                                         									fadeIn(tempgraph, [edgeTextNode]);
                                         								} 
                                         							}                                         
                                         						}
                                         					}
                                         					else
                                         					{
                                         						console.log("is not edge")
                                         					}*/
                                             			}
                                             			else if (stepDetails[0] == 'Fade Out')
                                             			{
                                             				tempgraph.setCellStyles('opacity', x[1], [cell]);
                                             				tempgraph.setCellStyles('noLabel',null, [cell]);
                                             				tempgraph.setCellStyles(mxConstants.STYLE_TEXT_OPACITY, x[1] , [cell]);
                                             				fadeOut(getNodesForCells(tempgraph, [cell]));
                                             				
                                             				/*if(cell.edge)
                                         					{
                                         						console.log("is edge");
                                         						var descendants=editorUi.editor.graph.getModel().getDescendants(cell);
                                         						for (var j = 0; j < descendants.length; j++)
                                         						{  
                                         							console.log("Descendants of Cell: "+cell.id + " Descendant Parent Id: "+descendants[j].parent.id + " Desc Value: "+descendants[j].value);
                                         							if(descendants.length > 0 && descendants[j].parent.id==cell.id)
                                         							{
                                         								if(descendants[j].value)
                                         								{
                                         									console.log(descendants[j].id);
                                         									edgeTextNode = mapping[descendants[j].id];
                                         									tempgraph.setCellStyles('opacity', stepDetails[1], [edgeTextNode]);
                                         									tempgraph.setCellStyles('noLabel', null, [edgeTextNode]);
                                         									fadeOut(tempgraph, [edgeTextNode]);
                                         								} 
                                         							}                                         
                                         						}
                                         					}
                                         					else
                                         					{
                                         						console.log("is not edge")
                                         					}*/
                                                                               
                                             			}
                                             			
                                             		}
                                             		else
                                                 	{
                                                 		alert('Something went wrong!');
     										//console.log('cell not found', id, steps[step]);
                                                 	}
                                                /*}
                            					else
                            					{
                            						if (tempgraph.getModel().isVertex(cell) || tempgraph.getModel().isEdge(cell))
                                					{
                            							tempgraph.setCellStyles('opacity',stepDetails[3] , [cell]);
                            							tempgraph.setCellStyles('noLabel', 1, [cell]);
                                					}
                            						
                            					}*/
                            					
                            					
                            				}
        						}
                                            
                                            
                                            
                                            
                                           
                                            
                                            
                                                        
                                                        //list.value= list.value + 'S ' +window.steps + 'G ' + grpStepDetails.length + '\n';
        							
        						});
                                                        
                               
                                
                                
                                
                    	}); 
                
      
                
                //td31.appendChild(nextPageBtn);
		//td31.appendChild(applyBtn);
		
                //td31.appendChild(refreshBtn);
               // td31.appendChild(clearBtn);
                td31.appendChild(testapplyBtn);
                
      /*          
		tr1.appendChild(td11);
		tr1.appendChild(td12);
		tbody.appendChild(tr1);
		tr2.appendChild(td21);
                tr3.appendChild(td31);
		tbody.appendChild(tr2);
                tbody.appendChild(tr3);
		table.appendChild(tbody);*/
                
        tr1.appendChild(td11);
        tr1.appendChild(td12);
        tbody.appendChild(tr1);
        tr2.appendChild(td21);
        tr3.appendChild(td31);
        tbody.appendChild(tr2);
        tbody.appendChild(tr3);
        table.appendChild(tbody);

		this.window = new mxWindow('Animation', table, x, y, w, h, true, true);
		this.window.destroyOnClose = false;
		this.window.setMaximizable(false);
		this.window.setResizable(true);
		this.window.setClosable(true);
		this.window.setVisible(true);
                
                
                
                
                
                 /*mxEvent.addListener(container, 'click', function(evt)
						{
							alert('run');
							run(editorUi,graph, list.value.split('\n'));
							
						});*/
                
            
	};
        
                        
        
var PresentationWindow = function(editorUi, graph, list)
	{
            var container = document.createElement('div');
		//container.style.border = '1px solid lightGray';
		//container.style.background = '#ffffff';
		container.style.width = document.body.width;
		container.style.height = document.body.height;
		container.style.overflow = 'auto';
               // container.appendChild(graph);
              
                
            mxEvent.addListener(container, 'click', function(evt)
            {
                alert('Hit');
                //animationWindow.run(animationWindow.editorUi,animationWindow.graph, animationWindow.list.value.split('\n'));
            });
        
            this.window= new mxWindow('Presentation',container,100,100,window.innerWidth, window.innerHeight,true,false);
            //this.window= new mxWindow('Presentation',container,0,0,screen.width,screen.height,true,false);
            
            
        };
        
        
// For animation and fading
function getNodesForCells(graph, cells)
	{
                
		var nodes = [];
		
		for (var i = 0; i < cells.length; i++)
		{
			var state = graph.view.getState(cells[i]);
			
			if (state != null)
			{
                           // alert('in getNodes');
				var shapes = graph.cellRenderer.getShapesForState(state);
				
				for (var j = 0; j < shapes.length; j++)
				{
					if (shapes[j] != null && shapes[j].node != null)
					{
						nodes.push(shapes[j].node);
					}
				}
				
				// Adds folding icon
				if (state.control != null && state.control.node != null)
				{
					nodes.push(state.control.node);
				}
			}
		}
		
		return nodes;
	};
	
	function fadeIn(nodes)
	{
            
		if (nodes != null)
		{
                   // alert('Executing fadein');
			for (var i = 0; i < nodes.length; i++)
			{
				mxUtils.setPrefixedStyle(nodes[i].style, 'transition', null);
				nodes[i].style.opacity = '0';
			}
			
			window.setTimeout(function()
			{
				for (var i = 0; i < nodes.length; i++)
				{
					mxUtils.setPrefixedStyle(nodes[i].style, 'transition', 'all 1s ease-in-out');
					nodes[i].style.opacity = '1';
				}
			}, 0);
		}
	};
	
	function fadeOut(nodes)
	{
		if (nodes != null)
		{
			for (var i = 0; i < nodes.length; i++)
			{
				mxUtils.setPrefixedStyle(nodes[i].style, 'transition', null);
				nodes[i].style.opacity = '1';
			}
			
			window.setTimeout(function()
			{
				for (var i = 0; i < nodes.length; i++)
				{
					mxUtils.setPrefixedStyle(nodes[i].style, 'transition', 'all 1s ease-in-out');
					nodes[i].style.opacity = '0';
				}
			}, 0);
		}
	};
	
	function createEdgeAnimation(state)
	{
		var pts = state.absolutePoints.slice();
		var segs = state.segments;
		var total = state.length;
		var n = pts.length;

		return {
			execute: function(step, steps)
			{
				if (state.shape != null)
				{
					var pts2 = [pts[0]];
					var dist = total * step / steps;
					
					for (var i = 1; i < n; i++)
					{
						if (dist <= segs[i - 1])
						{
							pts2.push(new mxPoint(pts[i - 1].x + (pts[i].x - pts[i - 1].x) * dist / segs[i - 1],
								pts[i - 1].y + (pts[i].y - pts[i - 1].y) * dist / segs[i - 1]));
							
							break;
						}
						else
						{
							dist -= segs[i - 1];
							pts2.push(pts[i]);
						}
					}
					
					state.shape.points = pts2;
					state.shape.redraw();
				}
			},
			stop: function()
			{
				if (state.shape != null)
				{
					state.shape.points = pts;
					state.shape.redraw();
				}
			}
		};
	};
	
	function createVertexAnimation(state)
	{
		var bds = new mxRectangle.fromRectangle(state.shape.bounds);
		var ttr = null;
		
		if (state.text != null && state.text.node != null && state.text.node.firstChild != null)
		{
			ttr = state.text.node.firstChild.getAttribute('transform');
		}
		
		return {
			execute: function(step, steps)
			{
				if (state.shape != null)
				{
					var f = step / steps;
					state.shape.bounds = new mxRectangle(bds.x, bds.y, bds.width * f, bds.height);
					state.shape.redraw();
					
					// Text is animated using CSS3 transitions
					if (ttr != null)
					{
						state.text.node.firstChild.setAttribute('transform', ttr + ' scale(' + f + ',1)');
					}
				}
			},
			stop: function()
			{
				if (state.shape != null)
				{
					state.shape.bounds = bds;
					state.shape.redraw();
					
					if (ttr != null)
					{
						state.text.node.firstChild.setAttribute('transform', ttr);
					}
				}
			}
		};
	};

	function animateCells(graph, cells, steps, delay)
	{
		steps = (steps != null) ? steps : 30;
		delay = (delay != null) ? delay : 30;
		
		var animations = [];
		
		for (var i = 0; i < cells.length; i++)
		{
			var state = graph.view.getState(cells[i]);

			if (state != null && state.shape != null && graph.model.isEdge(state.cell) &&
				state.absolutePoints != null && state.absolutePoints.length > 1)
			{
				animations.push(createEdgeAnimation(state));
			}
			else if (state != null && graph.model.isVertex(state.cell) &&
					state.shape != null && state.shape.bounds != null)
			{
				animations.push(createVertexAnimation(state));
				// TODO: include descendants
			}
		}
		
		var step = 0;
		
		function animate()
		{
			if (step == steps)
			{
				window.clearInterval(thread);
				
				for (var i = 0; i < animations.length; i++)
				{
					animations[i].stop();
				}
			}
			else
			{
				for (var i = 0; i < animations.length; i++)
				{
					animations[i].execute(step, steps);
				}
				
				step++;							
			}
		}
		
		var thread = window.setInterval(animate, delay);
		animate();
	};
	
	function mapCell(cell, clone, mapping)
	{
		
		mapping = (mapping != null) ? mapping : new Object();
		mapping[cell.id] = clone;
		console.log("In mapping: "+ mapping[cell.id].id);
		
		var childCount = cell.getChildCount();
		
		for (var i = 0; i < childCount; i++)
		{
			mapCell(cell.getChildAt(i), clone.getChildAt(i), mapping);
		}
		
		return mapping;
	};
	
	var allowedToRun = false;
	var running = false;
        var loop=true;
	
	function stop()
	{
		allowedToRun = false;
	};
	
	function run(editorUi,graph, steps, loop)
	{
            /*
           // alert(steps);
           // alert(loop);
            if(loop)
            {
          //  alert('Loop works');
            }
            
            
				for (var id in graph.getModel().cells)
				{
					var cell = graph.getModel().cells[id];
					
					if (graph.getModel().isVertex(cell) || graph.getModel().isEdge(cell))
					{
                                               // alert('In cell'+ id);
						graph.setCellStyles('opacity', '0', [cell]);
						graph.setCellStyles('noLabel', '1', [cell]);
					}
				}
                            //alert(editorUi.editor.graph.getModel().getRoot());
                            //alert(graph.getModel().getRoot());
                            var mapping = mapCell(editorUi.editor.graph.getModel().getRoot(), graph.getModel().getRoot());
                            //alert(mapping);
                            var step = 0;
                            allowedToRun=true;
                           // alert(steps.length);
                            if (allowedToRun && step < steps.length)
				{
                                   // alert('Inside if')
                                    
					var tokens = steps[step].split(' ');
					
					if (tokens.length > 0)
					{
						if (tokens[0] == 'wait' && tokens.length > 1)
						{
							window.setTimeout(function()
							{
								step++;
								next();
							}, parseFloat(tokens[1]));
						}
						else
						{
							if (tokens.length > 1)
							{
								var cell = mapping[tokens[1]];
								
								if (cell != null)
								{
                                                                   // alert('Inside cell')
									if (tokens[0] == 'show')
									{
										graph.setCellStyles('opacity', '100', [cell]);
										graph.setCellStyles('noLabel', null, [cell]);
										
										if (tokens.length > 2 && tokens[2] == 'fade')
										{
                                                                                  //  alert('Inside fade')
											fadeIn(getNodesForCells(graph, [cell]));
										}
										else
										{
											animateCells(graph, [cell]);
										}
									}
									else if (tokens[0] == 'hide')
									{
										fadeOut(getNodesForCells(graph, [cell]));
									}
								}
								else
								{
									console.log('cell not found', id, steps[step]);
								}
							}
							
							
						}
					}
				}*/
                                
            
           
		if (!running)
		{
			allowedToRun = true;
			running = true;

			graph.getModel().beginUpdate();
			try
			{
				for (var id in graph.getModel().cells)
				{
					var cell = graph.getModel().cells[id];
					
					if (graph.getModel().isVertex(cell) || graph.getModel().isEdge(cell))
					{
						graph.setCellStyles('opacity', '0', [cell]);
						graph.setCellStyles('noLabel', '1', [cell]);
					}
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
			
			var mapping = mapCell(editorUi.editor.graph.getModel().getRoot(), graph.getModel().getRoot());
			var step = 0;
			window.RunPage=0;
			function next()
			{
				if (allowedToRun && step < steps.length)
				{
					var tokens = steps[step].split(' ');
					
					if (tokens.length > 0)
					{
						if (tokens[0] == 'wait' && tokens.length > 1)
						{
							window.setTimeout(function()
							{
								step++;
								next();
							}, parseFloat(tokens[1]));
						}/*
                                                else if(tokens[0] == 'NextPage')
                                                {
                                                    graph.getModel().setRoot(editorUi.pages[window.RunPage].root);
                                                    window.RunPage++;
                                                    next();
                                                }*/
						else
						{
							if (tokens.length > 1)
							{
								var cell = mapping[tokens[1]];
								
								if (cell != null)
								{
									if (tokens[0] == 'show')
									{
										graph.setCellStyles('opacity', '100', [cell]);
										graph.setCellStyles('noLabel', null, [cell]);
										
										if (tokens.length > 2 && tokens[2] == 'fade')
										{
											fadeIn(getNodesForCells(graph, [cell]));
										}
										else
										{
											animateCells(graph, [cell]);
										}
									}
									else if (tokens[0] == 'hide')
									{
										fadeOut(getNodesForCells(graph, [cell]));
									}
								}
								else
								{
									console.log('cell not found', id, steps[step]);
								}
							}
							
							step++;
                                                        
							next();
						}
					}
				}
				else
				{
					running = false;
					
					if (loop)
					{
						// Workaround for edge animation
						graph.refresh();
						run(graph, steps, loop);
					}
				}
			};
                        
			next();
		}
	};