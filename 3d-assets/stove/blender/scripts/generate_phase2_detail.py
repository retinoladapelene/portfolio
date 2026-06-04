import bpy

def run_detail_generation():
    # 1. Hapus semua objek mesh yang ada agar mulai bersih
    if bpy.ops.object.mode_set.poll():
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    print("Memulai pembuatan Fase 2: Detail & Topologi Kompor...")

    # 2. Buat helper untuk membuat material dengan warna viewport khusus
    def create_viewport_material(name, diffuse_color, metallic=0.0, roughness=0.5):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        mat.diffuse_color = diffuse_color
        # Atur parameter viewport
        nodes = mat.node_tree.nodes
        principled = nodes.get("Principled BSDF")
        if principled:
            principled.inputs['Metallic'].default_value = metallic
            principled.inputs['Roughness'].default_value = roughness
        return mat

    # Definisikan Material Viewport detail
    mat_glass = create_viewport_material("Mat_Glass_Top", (0.05, 0.05, 0.05, 1.0), metallic=0.2, roughness=0.1)
    mat_metal = create_viewport_material("Mat_Metal_Brushed", (0.6, 0.6, 0.6, 1.0), metallic=0.9, roughness=0.3)
    mat_dark_metal = create_viewport_material("Mat_Dark_Cast", (0.15, 0.15, 0.15, 1.0), metallic=0.8, roughness=0.5)
    mat_indicator = create_viewport_material("Mat_Indicator_Red", (0.9, 0.05, 0.05, 1.0), metallic=0.0, roughness=0.4)

    # 3. Buat Bodi Utama Kaca (Chassis) - Ukuran: 80cm x 50cm x 6cm
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
    chassis = bpy.context.active_object
    chassis.name = "Kompor_Chassis"
    chassis.dimensions = (0.8, 0.5, 0.06)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    chassis.data.materials.append(mat_glass)

    # Berikan Bevel Modifier pada badan utama agar tepian kaca tidak tajam
    bevel_chassis = chassis.modifiers.new(name="Bevel_Kaca", type='BEVEL')
    bevel_chassis.width = 0.004  # 4mm bevel
    bevel_chassis.segments = 4
    bevel_chassis.limit_method = 'ANGLE'

    # 4. Potong Lubang Tungku menggunakan Boolean (Trik Profesional)
    # Kami membuat pemotong silinder sementara untuk melubangi bodi kompor
    def cut_hole(x_pos):
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=64, 
            radius=0.095, 
            depth=0.08, 
            location=(x_pos, 0.0, 0.02)
        )
        cutter = bpy.context.active_object
        cutter.name = "Cutter_Temp"
        
        # Tambahkan Boolean modifier ke chassis
        bool_mod = chassis.modifiers.new(name="Lubang_Tungku", type='BOOLEAN')
        bool_mod.operation = 'DIFFERENCE'
        bool_mod.object = cutter
        
        # Apply modifier
        bpy.context.view_layer.objects.active = chassis
        bpy.ops.object.modifier_apply(modifier=bool_mod.name)
        
        # Hapus pemotong
        bpy.ops.object.select_all(action='DESELECT')
        cutter.select_set(True)
        bpy.ops.object.delete()

    cut_hole(-0.2)  # Potong kiri
    cut_hole(0.2)   # Potong kanan

    # 5. Buat Tungku Burner Fisik di dalam lubang tersebut
    def build_detailed_burner(x_pos, name_suffix):
        # Ring Logam Luar (Stainless Ring)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=64, radius=0.094, depth=0.015, location=(x_pos, 0.0, 0.01)
        )
        outer_ring = bpy.context.active_object
        outer_ring.name = f"Tungku_Luar_{name_suffix}"
        outer_ring.data.materials.append(mat_metal)
        
        # Tambahkan Bevel pada ring agar menangkap cahaya
        bev = outer_ring.modifiers.new(name="Bevel_Ring", type='BEVEL')
        bev.width = 0.002
        bev.segments = 3

        # Burner Tengah Gelap (Cast Iron Cap)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=64, radius=0.075, depth=0.02, location=(x_pos, 0.0, 0.012)
        )
        inner_cap = bpy.context.active_object
        inner_cap.name = f"Tungku_Dalam_{name_suffix}"
        inner_cap.data.materials.append(mat_dark_metal)
        
        # Set Smooth Shading untuk bagian burner tengah (Aman untuk Blender 3.x dan 4.x+)
        bpy.ops.object.shade_smooth()
        if hasattr(inner_cap.data, 'use_auto_smooth'):
            inner_cap.data.use_auto_smooth = True
        else:
            try:
                bpy.ops.object.shade_auto_smooth()
            except Exception:
                pass

    build_detailed_burner(-0.2, "Kiri")
    build_detailed_burner(0.2, "Kanan")

    # 6. Buat Tombol Fisik Detail (Knobs) dengan piringan dan garis indikator
    def build_knob(x_pos, name_suffix):
        # Piringan Alas Tombol
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=32, radius=0.028, depth=0.002, location=(x_pos, -0.18, 0.031)
        )
        base = bpy.context.active_object
        base.name = f"Tombol_Alas_{name_suffix}"
        base.data.materials.append(mat_dark_metal)

        # Silinder Tombol Utama
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=32, radius=0.022, depth=0.015, location=(x_pos, -0.18, 0.038)
        )
        knob = bpy.context.active_object
        knob.name = f"Tombol_Putar_{name_suffix}"
        knob.data.materials.append(mat_metal)
        
        # Bevel untuk tombol
        bev_knob = knob.modifiers.new(name="Bevel_Tombol", type='BEVEL')
        bev_knob.width = 0.001
        bev_knob.segments = 3

        # Garis Indikator Merah di atas tombol (sebagai penanda level api)
        bpy.ops.mesh.primitive_cube_add(location=(x_pos, -0.165, 0.046))
        indicator = bpy.context.active_object
        indicator.name = f"Tombol_Indikator_{name_suffix}"
        indicator.dimensions = (0.002, 0.012, 0.002)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        indicator.data.materials.append(mat_indicator)

        # Satukan indikator dan alas ke tombol utama (Parenting) agar bisa diputar bersama
        bpy.ops.object.select_all(action='DESELECT')
        indicator.select_set(True)
        base.select_set(True)
        bpy.context.view_layer.objects.active = knob
        knob.select_set(True)
        bpy.ops.object.parent_set(type='OBJECT', keep_transform=True)

    build_knob(-0.08, "Kiri")
    build_knob(0.08, "Kanan")

    # 7. Tambahkan Panel Sentuh Digital di antara tombol
    bpy.ops.mesh.primitive_cube_add(location=(0.0, -0.18, 0.031))
    panel = bpy.context.active_object
    panel.name = "Panel_Sentuh"
    panel.dimensions = (0.08, 0.06, 0.002)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    panel.data.materials.append(mat_glass)
    
    bev_panel = panel.modifiers.new(name="Bevel_Panel", type='BEVEL')
    bev_panel.width = 0.001
    bev_panel.segments = 3

    # Fokuskan kamera viewport ke hasil akhir (Kompatibel untuk Blender 3.x dan 4.x+)
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

    print("Fase 2: Berhasil Dibuat!")

# Jalankan fungsi utama
run_detail_generation()
