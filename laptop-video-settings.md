# Ustawienia laptop + video

```css
.laptop-screen {
  position: absolute;
  top: 22%;
  left: 10.5%;
  width: 79.5%;
  height: 51.5%;
  overflow: hidden;
  border-radius: 6px;
  box-sizing: border-box;
}

.laptop-screen video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

Uwagi:
- Pozycjonowanie jest ustalone na stałe.
- Brak właściwości `right` i `bottom`.
- Brak nadpisujących reguł `@media` dla tej klasy.
- Wideo ma zostać wypełnione w ramce bez wycinania całej zawartości.
