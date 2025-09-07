procedure cursos
parameter wkey
@09,01 clear to 23,78
select 6 
use spcursos index spcursos.idx
select 7
use spdescur order curso
*wkey=str(wnumero,5)+wcatego
wnoment1=space(25)
*define window pcur from 10,1 to 22,77
*activate window pcur
@10,01 say 'Codigo Curso                            Fecha Egr. Entid.Otorgante'
wlinea=11
* @wlinea,2 say f.curso pict '999' in window pcur
* @wlinea,2 say f.curso pict '999'
WOP=0
select 6
seek(wkey)
if found()
	@wlinea,2 say f.curso pict '999'
   select 7
   seek(f.curso)
   if found()
      @wlinea,6 say descrip
   else
      @wlinea,6 say 'sin descripcion'
   endif
   @wlinea,38 say f.fechegr
   @wlinea,49 say f.curotor pict 'XXXX'
   select 3
   use spente order codigo
   seek(f.curotor)
   if found()
   	wnoment1=nombre
   else
   	wnoment1=space(25)	
   endif
   @wlinea,54 say wnoment1
   @23,10 get wop pict '@*H \<Continuar;\<Modificar;\<Baja' size 1,1
   read
   @23,01 clear to 23,78
   if wop = 3
      select 6
      delete
   else
      if wop = 2   
         select 7
         define window pcur1 from 15,40 to 22,77
         activate window pcur1
         brow in window pcur1
         deactivate window pcur1
         if curso<>999
            select 6
            wfechegr={  /  /  }
            wfechegr=fechegr
            replace f.curso  with g.curso
            replace f.titulo with b.titulo
            @21,65 say 'fecha de egreso'
            @wlinea,38 get wfechegr
            read
            replace fechegr with wfechegr
            @21,65 say 'Entidad Otorgante'
            select 3
            use spente order codigo
            define window pente1 from 15,40 to 22,77
            activate window pente1
            brow in window pente1
            deactivate window pente1
            wcodig=space(4)
            wcodig=c.codigo
            @14,60 say wcodig pict 'XXXX'
*           @14,70 get wop pict '9'
*           read
            select 6
            replace f.curotor with wcodig
            @22,70 say f.curotor pict 'XXXX'
*            read
            @wlinea,54 say c.nombre
         endif
      else
      	if wop=1
      		select 6
      		skip
      	endif   
      endif
   endif      
else
   @22,16 say 'Sin cursos de postgrado'
endif
wop=1
@23,30 get wop pict '@*H \<Salir;\<Agregar Curso' size 1,1
read
@23,01 clear to 23,78
if wop=2
   select 7
   define window pcur from 15,40 to 22,77
   activate window pcur
   brow in window pcur
   deactivate window pcur
   if curso<>999
      wfechegr={  /  /  }
      @21,65 say 'fecha de egreso'
      @wlinea,40 get wfechegr
      read
      @wlinea,5 say g.descrip
      @21,65 say 'Entidad Otorgante'
      select 3
      use spente order codigo
      define window pente1 from 15,40 to 22,77
      activate window pente1
      brow in window pente1
      deactivate window pente1
      wcodig=codigo
      @14,50 say wcodig pict 'XXXX'
*      @14,70 GET WOP PICT '9'
*      READ
      select 6
      append blank
      replace numero with int(val(substr(wkey,1,5)))
      replace catego with substr(wkey,6,2)
      replace curso  with g.curso
      replace titulo with wqtitulo
      replace fechegr with wfechegr
      replace f.curotor with wcodig
      @wlinea,55 say c.nombre
   endif
endif
deactivate window pcur   
return
