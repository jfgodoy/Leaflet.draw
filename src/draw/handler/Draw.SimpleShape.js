L.SimpleShape = {};

L.Draw.SimpleShape = L.Draw.Feature.extend({
	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
			this._map.dragging.disable();
			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';

			this._tooltip.updateContent({ text: this._initialLabelText });

			this._map
				.on('mousedown', this._onMouseDown, this)
				.on('mousemove', this._onMouseMove, this);

			L.DomEvent
				.on(this._container, 'touchstart', this._onTouchStart, this)
				.on(this._container, 'touchmove', this._onTouchMove, this);
		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);
		if (this._map) {
			this._map.dragging.enable();
			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			this._map
				.off('mousedown', this._onMouseDown, this)
				.off('mousemove', this._onMouseMove, this);

			L.DomEvent
				.off(this._container, 'touchstart', this._onTouchStart)
				.off(this._container, 'touchmove', this._onTouchMove);

			L.DomEvent.off(document, 'mouseup', this._onMouseUp);
			L.DomEvent.off(document, 'touchend', this._onTouchEnd);

			// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
			if (this._shape) {
				this._map.removeLayer(this._shape);
				delete this._shape;
			}
		}
		this._isDrawing = false;
	},

	_onMouseDown: function (e) {
		this._isDrawing = true;
		this._startLatLng = e.latlng;

		L.DomEvent
			.on(document, 'mouseup', this._onMouseUp, this)
			.on(document, 'touchend', this._onTouchEnd, this)
			.preventDefault(e.originalEvent);
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._tooltip.updateContent({ text: L.drawLocal.draw.handlers.simpleshape.tooltip.end });
			this._drawShape(latlng);
		}
	},

	_onMouseUp: function () {
		if (this._shape) {
			this._fireCreatedEvent();
		}

		this.disable();
	},

	_onTouchStart: function (e) {
		e.preventDefault();
		if (e.touches.length === 1) {
			var touch = e.touches[0];
			var mouseEvent = this._createMouseEvent(touch);
			this._onMouseDown(mouseEvent);
		}
	},

	_onTouchMove: function (e) {
		e.preventDefault();
		if (e.touches.length === 1) {
			var touch = e.touches[0];
			var mouseEvent = this._createMouseEvent(touch);
			this._onMouseMove(mouseEvent);
		}
	},

	_onTouchEnd: function (e) {
		this._onMouseUp(e);
	},

	_createMouseEvent: function (e) {
		var containerPoint = this._map.mouseEventToContainerPoint(e),
			layerPoint = this._map.containerPointToLayerPoint(containerPoint),
			latlng = this._map.layerPointToLatLng(layerPoint);
		return {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		};
	}


});