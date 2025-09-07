
import dbf
import json

def leer_dbf(archivo):
    tabla = dbf.Table(archivo)
    tabla.open()
    datos = []
    for registro in tabla:
        datos.append(dict(registro))
    tabla.close()
    return datos

# Leer SVPROF
svprof = leer_dbf('C:/copig-app/adminsp/COPIG/SVPROF.DBF')
print(f"SVPROF: {len(svprof)} registros")
# Mostrar primeros 3
for i, r in enumerate(svprof[:3]):
    if 'APELLNOM' in r:
        print(f"  {i+1}. {r.get('APELLNOM', '')} - DNI: {r.get('DOCUMENTO', '')}")

# Leer SOPROF  
soprof = leer_dbf('C:/copig-app/adminsp/COPIG/SOPROF.DBF')
print(f"\nSOPROF: {len(soprof)} registros")
# Mostrar primeros 3
for i, r in enumerate(soprof[:3]):
    nombre = f"{r.get('APELLIDO', '')}, {r.get('NOMBRE', '')}"
    print(f"  {i+1}. {nombre} - DNI: {r.get('DOCUMENTO', '')}")

# Guardar datos para JS
import json
with open('externos_temp.json', 'w') as f:
    json.dump({
        'svprof': svprof[:500],  # Primeros 500 para prueba
        'soprof': soprof[:500]
    }, f)

print("\nDatos guardados en externos_temp.json")
