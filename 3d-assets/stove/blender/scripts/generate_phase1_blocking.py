import bpy

def run_blocking_generation():
    # 1. Hapus semua objek mesh yang ada agar mulai bersih
    if bpy.ops.object.mode_set.poll():
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    print("Memulai pembuatan Fase 1: Blocking Kompor Modern...")

    # 2. Buat fungsi helper untuk membuat material dengan warna viewport khusus
    def create_viewport_material(name, diffuse_color):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        mat.diffuse_color = diffuse_color
        # Atur warna viewport di Eevee/Workbench
        mat.roughness = 0.5
        return mat

    # Warna-warna viewport untuk presentasi progres
    chassis_color = (0.08, 0.08, 0.08, 1.0)   # Abu-abu gelap (body kompor)
    burner_color = (0.3, 0.1, 0.1, 1.0)       # Merah marun (tungku pembakar)
    panel_color = (0.05, 0.2, 0.4, 1.0)       # Biru kaca (control panel)

    mat_chassis = create_viewport_material("Mat_Chassis", chassis_color)
    mat_burner = create_viewport_material("Mat_Burner", burner_color)
    mat_panel = create_viewport_material("Mat_Panel", panel_color)

    # 3. Buat Bodi Utama Kompor (Chassis) - Ukuran asli: 80cm x 50cm x 6cm
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
    chassis = bpy.context.active_object
    chassis.name = "Kompor_Chassis"
    chassis.dimensions = (0.8, 0.5, 0.06)
    
    # Terapkan Skala (Apply Scale) - PENTING untuk modifier Blender
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    chassis.data.materials.append(mat_chassis)

    # 4. Buat Tungku Kiri (Burner Left) - Diameter: 18cm, Tinggi: 1.5cm
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64, 
        radius=0.09, 
        depth=0.015, 
        location=(-0.2, 0.0, 0.03)
    )
    burner_l = bpy.context.active_object
    burner_l.name = "Tungku_Kiri"
    burner_l.data.materials.append(mat_burner)

    # 5. Buat Tungku Kanan (Burner Right) - Diameter: 18cm, Tinggi: 1.5cm
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64, 
        radius=0.09, 
        depth=0.015, 
        location=(0.2, 0.0, 0.03)
    )
    burner_r = bpy.context.active_object
    burner_r.name = "Tungku_Kanan"
    burner_r.data.materials.append(mat_burner)

    # 6. Buat Panel Kontrol Placeholder - Ukuran: 30cm x 8cm x 0.2cm
    bpy.ops.mesh.primitive_cube_add(location=(0.0, -0.18, 0.031))
    panel = bpy.context.active_object
    panel.name = "Panel_Kontrol"
    panel.dimensions = (0.3, 0.08, 0.002)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    panel.data.materials.append(mat_panel)

    # 7. Fokuskan kamera viewport ke kompor (Kompatibel untuk Blender 3.x dan 4.x+)
    try:
        for area in bpy.context.screen.areas:
            if area.type == 'VIEW_3D':
                for region in area.regions:
                    if region.type == 'WINDOW':
                        if hasattr(bpy.context, "temp_override"):
                            with bpy.context.temp_override(area=area, region=region):
                                bpy.ops.view3d.view_all(center=False)
                        else:
                            override = {'area': area, 'region': region, 'edit_object': bpy.context.edit_object}
                            bpy.ops.view3d.view_all(override, center=False)
                        break
    except Exception as e:
        print(f"Peringatan: Fokus viewport dilewati ({e})")

    print("Fase 1: Berhasil Dibuat!")

# Jalankan fungsi utama
run_blocking_generation()
