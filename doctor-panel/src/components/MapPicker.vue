<template>
  <div>
    <div ref="containerRef" style="height:240px;border-radius:14px;border:1.5px solid var(--ink-200);overflow:hidden" />
    <div v-if="address" class="map-address">{{ address }}</div>
    <div v-else class="map-address" style="color:var(--ink-400)">Konumunuzu seçmek için haritaya tıklayın</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  onChange: (lat: number, lng: number, addr: string) => void
  initialLat?: number | null
  initialLng?: number | null
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const address = ref('')
let mapInstance: any = null
let markerInstance: any = null

onMounted(async () => {
  if (!containerRef.value) return

  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  const center: [number, number] = props.initialLat && props.initialLng
    ? [props.initialLat, props.initialLng]
    : [35.4670, 44.3921]

  const map = L.map(containerRef.value).setView(center, 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(map)

  if (props.initialLat && props.initialLng) {
    markerInstance = L.marker([props.initialLat, props.initialLng]).addTo(map)
  }

  map.on('click', async (e: any) => {
    const { lat, lng } = e.latlng
    if (markerInstance) markerInstance.remove()
    markerInstance = L.marker([lat, lng]).addTo(map)
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`)
      const d = await r.json()
      const addr = d.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      address.value = addr
      props.onChange(lat, lng, addr)
    } catch {
      const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      address.value = addr
      props.onChange(lat, lng, addr)
    }
  })

  mapInstance = map
})

onUnmounted(() => {
  if (mapInstance) { mapInstance.remove(); mapInstance = null }
})
</script>
