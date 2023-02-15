/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { throws } from 'assert';
import { LocationMngr } from 'src/app/services/location-manager';

declare const google;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  @ViewChild('map') mapElement!: ElementRef;

  private jsMapOptions: any = {
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#3d5b85' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#3d5b85' }],
      },
    ],
    zoom: 12,
    center: {
      lat: 42.87036071967292,
      lng: -8.544190745035303
    },
    mapTypeId: google.maps.MapTypeId.ROAD, // HYBRID
    zoomControl: false,
    streetViewControl: false,
    overviewMapControl: false,
    rotateControl: false,
    fullscreenControl: false,
    /*
     panControl: false,
     mapTypeControl: false,
     scaleControl: false,
     keyboardShortcuts: false
     scrollwheel: false,
    */
  };

  private map: any;

  private radarMarckers: any;

  private deviceMarker: any;

  private deviceMarkerOptions: any = {
    draggable: false,
    position: { lat: 0, lng: 0 },
    animation: google.maps.Animation.DROP,
    title: 'Device',
    icon: {
      url: './assets/img/KITT.png',
      scaledSize: new google.maps.Size(20, 20),
    }
  };

  private markerOptions: any = {
    draggable: false,
    position: { lat: 0, lng: 0 },
    // animation: google.maps.Animation.DROP,
    title: 'Device',
    icon: {
      url: './assets/img/radar-icon.png',
      scaledSize: new google.maps.Size(15, 15),
    }
  };

  private watchSubscribe: any; // TODO unsubscribe al salir

  private forceCenter = false;

  constructor(
    private location: LocationMngr
  ) { }

  ngOnInit() {
    this.init();
  }

  private init() {
    setTimeout(() => {
      this.map = new google.maps.Map(this.mapElement.nativeElement, this.jsMapOptions);
    }, 1);
    setTimeout(() => {
      this.initRadars();
      // this.updateDeviceLocation(42.8677944851404, -8.539335546971877);
    }, 250);
    setTimeout(() => {
      this.watchSubscribe = this.location.getPositionObservable().subscribe(async (value: any) => {
        this.updateDeviceLocation(value.coords.latitude, value.coords.longitude);
      });
    }, 1000 * 1.5);
  }


  private initRadars() {
    this.radarMarckers = [];
    for (const radar of LocationMngr.radarTJson) {
      if (radar.coords.length) {
        this.markerOptions.map = this.map;
        this.markerOptions.position = { lat: radar.coords[0].lat, lng: radar.coords[0].long };
        this.radarMarckers.push(new google.maps.Marker(this.markerOptions));
      }
    }
  }

  private updateDeviceLocation(lat: number, lng: number) {
    if (!this.deviceMarker) {
      this.deviceMarkerOptions.map = this.map;
      this.deviceMarkerOptions.position = { lat: lat, lng: lng };
      this.deviceMarker = new google.maps.Marker(this.deviceMarkerOptions);
    }
    this.map.setCenter(new google.maps.LatLng(lat, lng));
    if (this.forceCenter) {
      this.deviceMarker.setPosition({ lat: lat, lng: lng });
    }
  }


}
