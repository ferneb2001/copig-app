procedure profju01
*  graba fecha de certificado en profjub
set talk off
@04,01 clear to 23,78
@04,24 say 'graba  CERTIFICADOS EMITIDOS'
@06,15 say 'Fecha      :'
@08,15 say 'Matricula  :'
@08,35 say 'Categoria:'
@10,15 say 'Labor Prof.:'
@12,15 say 'Comitente  :'
@14,15 say 'Certificado:'
set date to dmy
set century on
wsigue = 's'
wcontinua = 's'
wcatego=space(2)
wnom=space(30)
wfecha={  /  /    }
wcomit=space(30)
wcerti=0
wlabor=space(15)
wmatri=0
wkey=space(7)
wkey1=space(9)
wop=0
select 1
use profjub order numero
select 2
use spcerxx order cefecha
go top
wtermina='s'
do while not eof()
	if cefecha>{31/12/1993}
		if cecateg='A '
			@14,30 say cecerti
			@06,32 say cefecha
			select 1
			seek(b.cematri)
			if found()
				if a.fcertif={  /  /    }
					replace a.fcertif with b.cefecha
				endif
				if year(b.cefecha)= 1995
					replace cer1995 with cer1995+1
				else
					if year(b.cefecha)= 1996
						replace cer1996 with cer1996+1
					else	
						if year(b.cefecha)= 1997
							replace cer1997 with cer1997+1
						else
							if year(b.cefecha)= 1998
								replace cer1998 with cer1998+1
							else	
								if year(b.cefecha)= 1999
									replace cer1999 with cer1999+1
								else
									if year(b.cefecha)= 2000
										replace cer2000 with cer2000+1
									else
										if year(b.cefecha)= 2001
											replace cer2001 with cer2001+1
										else
											if year(b.cefecha)= 2002
												replace cer2002 with cer2002+1
											else
												if year(b.cefecha)= 2003
													replace cer2003 with cer2003+1
												else
													if year(b.cefecha)= 2004
														replace cer2004 with cer2004+1
													else
														if year(b.cefecha)= 2005
															replace cer2005 with cer2005+1
														else
															if year(b.cefecha)= 1994
																replace cer1994 with cer1994+1
															endif	
														endif	
													endif	
												endif	
											endif	
										endif	
									endif	
								endif	
							endif	
						endif	
					endif
				endif		
			endif
		endif
	endif	
	select 2
	skip	
enddo         
close all
@04,01 clear to 23,78
return

   