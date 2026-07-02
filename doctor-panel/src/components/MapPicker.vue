<template>
  <div class="map-picker-wrap">
    <div ref="mapRef" style="height:240px;border-radius:14px;border:1.5px solid var(--ink-200);overflow:hidden;background:#f8f9fa;">
      <div v-if="!isLoaded" style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--ink-400);font-size:14px;">
        Google Haritalar yükleniyor...
      </div>
    </div>
    <div v-if="address" class="map-address" style="margin-top:8px;font-size:13px;color:var(--ink-600);">📍 {{ address }}</div>
    <div v-else class="map-address" style="margin-top:8px;font-size:13px;color:var(--ink-400);">Konumunuzu seçmek için haritaya tıklayın</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  onChange: (lat: number, lng: number, addr: string) => void
  initialLat?: number | null
  initialLng?: number | null
}>()

const mapRef = ref<HTMLDivElement | null>(null)
const address = ref('')
const isLoaded = ref(false)

let map: google.maps.Map | null = null
let marker: google.maps.Marker | null = null
let geocoder: google.maps.Geocoder | null = null

onMounted(() => {
  if (!window.google) {
    const script = document.createElement('script')
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMap`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
    ;(window as any).initGoogleMap = initMap
  } else {
    initMap()
  }
})

function initMap() {
  if (!mapRef.value) return
  isLoaded.value = true

  const lat = props.initialLat ?? 35.4670 // default to Iraq (Kirkuk approx)
  const lng = props.initialLng ?? 44.3921

  map = new window.google.maps.Map(mapRef.value, {
    center: { lat, lng },
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  })

  geocoder = new window.google.maps.Geocoder()

  if (props.initialLat && props.initialLng) {
    marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
    })
  }

  map.addListener('click', (e: any) => {
    const clickedLat = e.latLng.lat()
    const clickedLng = e.latLng.lng()

    if (marker) marker.setMap(null)
    marker = new window.google.maps.Marker({
      position: e.latLng,
      map: map,
      animation: window.google.maps.Animation.DROP,
    })

    geocoder?.geocode({ location: e.latLng }, (results, status) => {
      let addr = `${clickedLat.toFixed(5)}, ${clickedLng.toFixed(5)}`
      if (status === 'OK' && results && results[0]) {
        addr = results[0].formatted_address
      }
      address.value = addr
      props.onChange(clickedLat, clickedLng, addr)
    })
  })
}

onUnmounted(() => {
  if (marker) marker.setMap(null)
  map = null
})
</script>
